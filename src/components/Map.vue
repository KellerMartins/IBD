<template>
  <div v-resize="$_map_resize" id="container">
      <div id="colormap" v-if="colormap">
        <div style="margin-bottom: 20px;">
          <p class="label">Altitude</p>
        </div>
        <v-sheet width=100% height=33%>
          <img :src="'/textures/' + colormap + '.png'" style="width: 100%; height: 100%;">
        </v-sheet>
        <div style="margin-bottom: 20px">
          <p class="label" style="left: 0">0%</p>
          <p class="label" style="left: 47%">50%</p>
          <p class="label" style="right: 0">100%</p>
        </div>
    </div>
    <!-- Selection Button -->
    <v-btn
      fab
      left
      fixed
      bottom
      :dark="!selectionMode && !hasSelection"
      :loading="!loadedMap"
      :color="selectionMode || hasSelection ? 'yellow':'cyan'"
      v-if="loadedMap && showSelectButton && (groupingLevel === 2 || (hasSelection && groupingLevel === 1))"
      @click="$_map_pressedSelect"
    >
      <v-icon v-if="!hasSelection && groupingLevel === 2">mdi-selection</v-icon>
      <v-icon v-if="hasSelection && groupingLevel !== 0">mdi-close</v-icon>
    </v-btn>


    <v-overlay :value="failedToLoad" z-index=100>
      <v-container fluid class="pa-0">
        <v-row align="center">
          <div class="text-center">
            <h2>Falha na conexão com o servidor</h2>
            <h3>Tente novamente mais tarde</h3>
              <v-btn 
                class="ma-2"
                outlined
                @click="$_map_reloadPage"
              >Recarregar
            </v-btn>
          </div>
        </v-row>
      </v-container>
    </v-overlay>
  </div>
</template>

<script>
import * as THREE from 'three'
import poly2tri from 'poly2tri'
import OrbitControls from '@/plugins/OrbitControls.js'
import hull from '@/plugins/hull.js'
import isMobile from '@/plugins/isMobile.js'

function clamp(number, min, max) {
  return Math.max(min, Math.min(number, max));
}

function getMultiplier() {
  var res = screen.height * window.devicePixelRatio
  return res / 768;
}

function geometryFromContour(contour) {
  contour.pop()
  var tris = new poly2tri.SweepContext(contour).triangulate().getTriangles();
  var geo = new THREE.Geometry();

  for (var i = 0; i < tris.length; i++) {
    var tri = tris[i];
    var v1, v2, v3;
          
    v1 = new THREE.Vector3( tri.getPoint(0).vx, tri.getPoint(0).vy, tri.getPoint(0).vz );
    v2 = new THREE.Vector3( tri.getPoint(1).vx, tri.getPoint(1).vy, tri.getPoint(1).vz );
    v3 = new THREE.Vector3( tri.getPoint(2).vx, tri.getPoint(2).vy, tri.getPoint(2).vz );
    
    geo.vertices[ geo.vertices.length ] = v1;
    geo.vertices[ geo.vertices.length ] = v2;
    geo.vertices[ geo.vertices.length ] = v3;
    
    var face = new THREE.Face3();
    
    face.a = geo.vertices.length - 3;
    face.b = geo.vertices.length - 2;
    face.c = geo.vertices.length - 1;
    
    geo.faces.push( face );
    
    geo.mergeVertices();
  }
  return geo;
}

function getContour(points, vecs, concavity) {
  var temp_points = points.map((a, i) => ({index:i, x:a.latitude, y:a.longitude, vx:vecs[i].x, vy:vecs[i].y, vz:vecs[i].z}));
  var h = hull(temp_points, concavity, ['.x', '.y']);
  return h
}


export default {
  name: 'Map',
  data() {
    return {
      camera: null,
      scene: null,
      renderer: null,
      loadedMap: false,
      selecting: false,
      hasSelection: false,
      selectionMode: false,
      failedToLoad: false,
    }
  },
  props: {
    showSelectButton: Boolean,
    groupingLevel: Number,
    colormap: {
      type: String,
      default: ""
    }
  },
  watch: { 
    groupingLevel: function(val) {
      switch (val) {
        case 0:
          this.ufs_cloud.material.uniforms.opacity.value = 0.25
          this.municipios_cloud.material.uniforms.opacity.value = 0.5
        break;

        case 1:
          this.ufs_cloud.material.uniforms.opacity.value = 1.0
          this.municipios_cloud.material.uniforms.opacity.value = 0.25
        break;

        case 2:
          this.ufs_cloud.material.uniforms.opacity.value = 0.25
          this.municipios_cloud.material.uniforms.opacity.value  = 1.0
        break;
      }
    },
    colormap: function(val) {
      var tex = val
      if (val == "")
        tex = "default"
      
      new THREE.TextureLoader().load("/textures/" + tex + ".png",
        function (texture) {
          this.ufs_cloud.material.uniforms.colormap.value = texture
          this.municipios_cloud.material.uniforms.colormap.value = texture
        }.bind(this))

    },
  },
  methods: { 
    //------------------------------------------// Public Methods
    selectCountry: function() {
      this.hasSelection = true
      let meanCoord = function(a, o) {
            return {x: (a.x+o.latitude), 
                    y: (a.y+o.longitude)}
          }
      var coord = this.ufs.reduce(meanCoord, {x:0, y:0})
      coord = {x:coord.x/this.ufs.length, y:coord.y/this.ufs.length, z:101}
      this.coord_center = this.geographicToSpherical(coord)

      var wpos = this.geographicToCartesian(coord)
      var pos = this.cartesianToScreen(wpos)
      return pos;
    },

    toggleSelectionMode: function() {
      if (this.selectionMode)
        this.disableSelectionMode()
      else
        this.enableSelectionMode()

      this.$_map_resetSelectionSphere()
    },

    enableSelectionMode: function() {
      this.selectionMode = true
      this.$emit('enabledSelectionMode')
    },

    disableSelectionMode: function() {
      this.selectionMode = false
      this.selecting = false
      this.$emit('disabledSelectionMode')
    },

    clearSelection: function() {
      this.selectionMode = false
      this.selecting = false
      this.hasSelection = false
      this.$_map_resetSelectionSphere()
      this.$emit('clearedSelection')
    },


    //TODO: Figure out a correct conversion between coordinate systems
    geographicToSpherical: function(pos){
      return new THREE.Vector3((pos.x-90)*Math.PI/180, 
                               (pos.y+90)*Math.PI/180, 
                               pos.hasOwnProperty('z')? pos.z : 100);
    },

    sphericalToGeographic: function(pos){
      return new THREE.Vector3((pos.x*180/Math.PI) + 90, 
                               (pos.y*180/Math.PI) - 90, 
                               pos.hasOwnProperty('z')? pos.z : 100);
    },

    sphericalToCartesian(pos) {
      var phi = -pos.x;
      var theta = pos.y;
      var r = pos.hasOwnProperty('z')? pos.z : 100;
      var x = r * Math.sin(phi) * Math.cos(theta)
      var z = r * Math.sin(phi) * Math.sin(theta)
      var y = r * Math.cos(phi)
      return new THREE.Vector3(-x, y, z)
    },

    geographicToCartesian(pos) {
      return this.sphericalToCartesian(this.geographicToSpherical(pos))
    },

    cartesianToSpherical(pos) {
      var rho = Math.sqrt(pos.x*pos.x + pos.y*pos.y + pos.z*pos.z)
      var theta = Math.atan(pos.z/-pos.x)
      var phi = -Math.acos(pos.y/rho)
      return new THREE.Vector2(phi, theta)
    },

    cartesianToGeographic(pos) {
      var sph = this.cartesianToSpherical(pos)
      return new THREE.Vector2(sph.x*180/Math.PI + 90, sph.y*180/Math.PI - 90)
    },

    cartesianToScreen(pos) {
      var rect = this.renderer.domElement.getBoundingClientRect();
      var width = window.innerWidth, height = window.innerHeight;
      var widthHalf = width / 2, heightHalf = height / 2;

      var p = new THREE.Vector3(pos.x, pos.y, pos.z)
      p.project(this.camera);
      p.x = ( p.x * widthHalf ) + widthHalf + rect.left;
      p.y = - ( p.y * heightHalf ) + heightHalf + rect.top;

      return p;
    },


    drawDebug: function(pos) {
      var geometry = new THREE.SphereGeometry( 5, pos.x != 0? 8:8, 4)
      var material = new THREE.MeshBasicMaterial( {color: 0xff0000, side: THREE.DoubleSide, opacity:0.75, transparent:true, depthTest:false} )
      var dbg = new THREE.Mesh( geometry, material )
      this.scene.add(dbg)
      dbg.position = pos
    },



    //------------------------------------------// Private Methods
    $_map_reloadPage(){
      window.location.reload()
    },

    $_map_init: function() {
      let container = document.getElementById('container')

      this.camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 1200 )
      this.camera.position.x = -194
      this.camera.position.y = -70
      this.camera.position.z = 151
      this.camera.rotation = new THREE.Euler( 0.3043099695380036,
                                             -0.860184479114381,
                                              0.2386270538109674, 'XYZ')
      this.lastCameraPosition = {x:0, y:0, z:0}

      this.controls = new OrbitControls(this.camera)
      this.controls.minAzimuthAngle = -1.2505353212390744
      this.controls.maxAzimuthAngle = -0.5880577929697266
      this.controls.minPolarAngle = 1.501431561249383
      this.controls.maxPolarAngle = 2.1858312277969334
      this.controls.maxDistance = 280
      this.controls.minDistance = 115
      this.controls.rotateSpeed = 0.125
      this.controls.panSpeed = 0.0
      this.controls.zoomSpeed = 0.75
      this.controls.screenSpacePanning = true

      this.scene = new THREE.Scene()
      this.scene.background = new THREE.Color( 0xedfcfb )

      this.renderer = new THREE.WebGLRenderer({ alpha:true, antialias: true })
      this.renderer.setPixelRatio( window.devicePixelRatio )
      this.renderer.setSize( window.innerWidth, window.innerHeight )
      container.parentNode.appendChild( this.renderer.domElement )
      this.renderer.domElement.id = "mapCanvas"
      this.controls.domElement = this.renderer.domElement

      this.moved = false;
      this.mouse = new THREE.Vector2()
      this.raycaster = new THREE.Raycaster()
      this.raycaster.params.Points.threshold = 2

      this.coord_move = new THREE.Vector2()
      this.coord_start = new THREE.Vector2()
      this.coord_end = new THREE.Vector2()

      this.intersection_sphere = null;

      var geometry = new THREE.SphereBufferGeometry( 0.1, 4, 4)
      var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide, opacity:1.0, transparent:true, depthTest:false} )
      this.sphere_region = new THREE.Mesh( geometry, material )
      this.scene.add(this.sphere_region)

      document.addEventListener('mousemove', this.$_map_onMouseMove, false)
      document.addEventListener('mousedown', this.$_map_onMouseDown, false)
      document.addEventListener('mouseup', this.$_map_onMouseUp, false)

      document.addEventListener('touchstart', this.$_map_onTouchDown, false );
      document.addEventListener('touchend', this.$_map_onTouchUp, false );
      document.addEventListener('touchmove', this.$_map_onTouchMove, false );

      this.lastMoved = Date.now();
      this.movedEventDelay = isMobile()? 1000/15 : 1000/60;

    },

    $_map_animate: function() {
      
      requestAnimationFrame(this.$_map_animate)
      var p = this.camera.position
      var dist = Math.sqrt(p.x*p.x + p.y*p.y + p.z*p.z)
      var k = (dist-this.controls.minDistance) / (this.controls.maxDistance - this.controls.minDistance)
      this.controls.rotateSpeed = k*0.16 + (1-k)*0.0125

      this.controls.enabled = !this.selectionMode

      if (this.hasSelection && Date.now() > this.lastMoved + this.movedEventDelay&&
          (this.camera.position.x != this.lastCameraPosition.x ||
           this.camera.position.y != this.lastCameraPosition.y ||
           this.camera.position.z != this.lastCameraPosition.z)) {
        this.lastCameraPosition.x = this.camera.position.x
        this.lastCameraPosition.y = this.camera.position.y
        this.lastCameraPosition.z = this.camera.position.z
        
        var wpos = this.sphericalToCartesian(this.coord_center)
        var pos = this.cartesianToScreen(wpos)
        this.$emit('moved', pos, k)
        this.moved = true
        this.lastMoved = Date.now()
      }

      this.renderer.render(this.scene, this.camera)
    },

    $_map_resize: function() {
      if (this.renderer && this.camera) {
        if (typeof this.portrait !== 'undefined'){
          if (isMobile() && this.portrait == window.innerWidth < window.innerHeight)
            return;
        }
        this.portrait = (window.innerWidth < window.innerHeight)

        var width = window.innerWidth
        var height = window.innerHeight
        this.camera.aspect = width / height
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(width, height)

        let multiplier = getMultiplier();
        if (typeof this.ufs_cloud !== 'undefined')
          this.ufs_cloud.material.uniforms.multiplier.value = multiplier
        
        if (typeof this.municipios_cloud !== 'undefined')
          this.municipios_cloud.material.uniforms.multiplier.value = multiplier
      }
    },

    $_map_pressedSelect: function() {
        if (!this.hasSelection) {
          this.toggleSelectionMode()
        } else {
          this.clearSelection()
        }
        this.hasSelection = false
    },

    $_map_onSelectionDown: function() {
      this.moved = false
      if (this.selectionMode) {

        var intersect = this.$_map_getMouseIntersection()
        if (intersect) {
          this.coord_start = this.cartesianToSpherical(intersect)
          this.selecting = true
        }
      }
    },

    $_map_onSelectionUpRegion: function() {
      if (this.selectionMode && this.selecting) {

        var intersect = this.$_map_getMouseIntersection()
        if (intersect) {
          this.selecting = false
          this.coord_end = this.cartesianToSpherical(intersect)
          if (this.coord_start.distanceTo(this.coord_end) > 0) {
            this.hasSelection = true
            
            var geoStart = this.sphericalToGeographic(this.coord_start)
            var geoEnd = this.sphericalToGeographic(this.coord_end)
            var geoMin = {x:Math.min(geoStart.x, geoEnd.x), y:Math.min(geoStart.y, geoEnd.y)}
            var geoMax = {x:Math.max(geoStart.x, geoEnd.x), y:Math.max(geoStart.y, geoEnd.y)}
            
            this.coord_center = new THREE.Vector3().addVectors(this.coord_start, this.coord_end).divideScalar(2)
            this.coord_center = {x:this.coord_center.x, y:this.coord_center.y, z:105}

            var wpos = this.sphericalToCartesian(this.coord_center)
            var pos = this.cartesianToScreen(wpos)

            this.$emit('selectedRegion', pos, geoMin, geoMax)

            this.$_map_changeSelectionSphere(this.coord_start, this.coord_end)
            this.disableSelectionMode()
          } else {
            this.clearSelection()
            this.selectionMode = true
          }
        }
      }
    },

    $_map_onSelectionUpUF: function() {
      let intersect = this.$_map_getMouseIntersection()
      if (intersect && !this.moved) {
        this.hasSelection = true
        let coord = {x:this.ufs[intersect].latitude, y:this.ufs[intersect].longitude, z:101}
        this.coord_center = this.geographicToSpherical(coord)

        var wpos = this.geographicToCartesian(coord)
        var pos = this.cartesianToScreen(wpos)
        this.$emit('selectedUF', this.ufs[intersect].sigla, pos)
      }
    },

    $_map_onSelectionUp: function() {
      if (this.groupingLevel == 2) {
        this.$_map_onSelectionUpRegion()
      } else if (this.groupingLevel == 1) {
        this.$_map_onSelectionUpUF()
      }
    },

    $_map_onSelectionMove: function() {
      var intersect = this.$_map_getMouseIntersection()
      if (intersect) {

        if (this.selecting) {
          this.coord_move = this.cartesianToSpherical(intersect)
          if (this.coord_start.distanceTo(this.coord_move) > 0)
            this.$_map_changeSelectionSphere(this.coord_start, this.coord_move)
        }
      }
    },

    // Mouse interaction
    $_map_onMouseDown() {
      event.preventDefault()
      this.$_map_onSelectionDown()
    },

    $_map_onMouseMove() {
      event.preventDefault()

      var rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x =   ((event.clientX - rect.left) / window.innerWidth ) * 2 - 1;
      this.mouse.y = - ((event.clientY - rect.top) / window.innerHeight ) * 2 + 1;

      this.$_map_onSelectionMove()
    },

    $_map_onMouseUp() {
      event.preventDefault()
      this.$_map_onSelectionUp()
    },


    // Touch interaction
    $_map_onTouchDown() {
      var rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x =   ((event.touches[0].pageX - rect.left) / window.innerWidth ) * 2 - 1;
      this.mouse.y = - ((event.touches[0].pageY - rect.top) / window.innerHeight ) * 2 + 1;

      this.$_map_onSelectionDown()
    },

    $_map_onTouchMove(  ) {
      var rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x =   ((event.touches[0].pageX - rect.left) / window.innerWidth ) * 2 - 1;
      this.mouse.y = - ((event.touches[0].pageY - rect.top) / window.innerHeight ) * 2 + 1;

      this.$_map_onSelectionMove()
    },

    $_map_onTouchUp() {
      this.$_map_onSelectionUp()
    },


    $_map_getMouseIntersection: function() {
      if (this.groupingLevel == 2) {
        if (this.intersection_sphere) {
          this.raycaster.setFromCamera( this.mouse, this.camera )
          let inters = this.raycaster.intersectObject(this.intersection_sphere)
          if (inters.length > 0)
            return inters[0].point
          
        } else {
          this.intersection_sphere = new THREE.Mesh( new THREE.SphereGeometry( 100, 32, 32 ), new THREE.MeshBasicMaterial( {color: 0xffff00} ))
        }
      } else if (this.groupingLevel == 1) {
        this.raycaster.setFromCamera(this.mouse, this.camera)
          let inters = this.raycaster.intersectObject(this.ufs_cloud)
          if (inters.length > 0)
            return inters[0].index
      }
      return false
    },

    $_map_changeSelectionSphere(start, end) {
      var phi_min = Math.min(start.y, end.y)
      var phi_max = Math.max(start.y, end.y)
      var theta_min = Math.min(start.x, end.x)
      var theta_max = Math.max(start.x, end.x)

      this.sphere_region.geometry.dispose()
      this.sphere_region.geometry = new THREE.SphereBufferGeometry( 100, 8, 4, 
        start.y, (phi_max-phi_min) * Math.sign(end.y-start.y),
        -start.x, (theta_max-theta_min) * Math.sign(start.x-end.x))
    },

    $_map_resetSelectionSphere: function() {
      this.sphere_region.geometry.dispose()
      this.sphere_region.geometry = new THREE.SphereBufferGeometry( 0.1, 4, 4)
    },



    $_map_generate_point_cloud(points) {
      var vertices = [];
      var point_sizes =  [];
      var heights = [];
      for(let i = 0; i < points.length; i++) {
        var point = points[i];
        var r = 100 + point.altitude/1000;
        vertices.push(this.geographicToCartesian(new THREE.Vector3(point.latitude, point.longitude, r)));
        point_sizes.push(point.tamanho);
        heights.push(point.altitude);
      }

      var positions = new Float32Array( vertices.length * 3 );
      var values = new Float32Array( vertices.length);
      var sizes = new Float32Array( vertices.length );

      var vertex;

      for (let i = 0, l = vertices.length; i < l; i++) {
        vertex = vertices[ i ];
        vertex.toArray( positions, i * 3 );

        values[i] = clamp(heights[i]/1000, 0, 1);
        sizes[ i ] = point_sizes[i]*8;
      }

      var geometry = new THREE.BufferGeometry();
      geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.addAttribute('value', new THREE.BufferAttribute(values, 1));
      geometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1));

      var spriteTex = new THREE.TextureLoader().load("/textures/disc.png");
      var colormapTex = new THREE.TextureLoader().load("/textures/default.png");
      var material = new THREE.ShaderMaterial( {
        uniforms: {
          sprite: { value: spriteTex },
          colormap: { value: colormapTex},
          opacity: { value: 1 },
          multiplier: { value: getMultiplier() }
        },
        vertexShader: `
        attribute float size;
        attribute float value;

        uniform float multiplier;

        varying float t;
        varying float fade;

        void main() {
            t = value;
            vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

            fade = clamp(( 30.0 / -mvPosition.z ), 0.0, 1.0);
            gl_PointSize = size * multiplier * ( 20.0 / -mvPosition.z );
            gl_Position = projectionMatrix * mvPosition;
        }`,
        fragmentShader:`
        uniform sampler2D colormap;
        uniform sampler2D sprite;
        uniform float opacity;

        varying float t;
        varying float fade;

        void main() {
          vec4 tex = texture2D(sprite, gl_PointCoord);
          vec3 color = texture2D(colormap, vec2(t, 0.5)).xyz;
          gl_FragColor = vec4(color * ((1.0-fade)*vec3(0.99,0.99,0.99) + fade*tex.rgb), tex.a*opacity);
        }`,
        transparent: true,
        depthTest: false
      } );

      return new THREE.Points( geometry, material );
    },

    $_map_generate_map_meshes(points) {
      var meshes = [];
      var vertices = [];
      for(let i = 0; i < points.length; i++) {
        var point = points[i];
        var r = 100 + point.altitude/1000;
        vertices.push(this.geographicToCartesian(new THREE.Vector3(point.latitude, point.longitude, r)));
      }

      var map_contour = getContour(points, vertices, 3);
      var map_outline_geo = new THREE.Geometry();
      for (let i = 0; i < map_contour.length-1; i++){
        map_outline_geo.vertices.push(new THREE.Vector3( map_contour[i].vx, map_contour[i].vy, map_contour[i].vz+0.01) );
      }
      
      meshes.push(new THREE.LineLoop(map_outline_geo, new THREE.LineBasicMaterial( { color: 0x000000, linewidth: 3 } ) ) );


      var map_geo = geometryFromContour(map_contour);
      var map_mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xcaed72),
        side: THREE.DoubleSide,
      })
      meshes.push(new THREE.Mesh(map_geo, map_mat));

      return meshes;
    },
  },
  mounted() {
    this.$_map_init()
    let err = response => { throw new Error(response.status) }
    this.$http.get('/api/coordenadas/municipios')
      .then(response => { return response.json() }, err)
      .then(points =>{
        this.municipios_cloud = this.$_map_generate_point_cloud(points.municipios)
        this.scene.add(this.municipios_cloud)
        
        var map_meshes = this.$_map_generate_map_meshes(points.municipios)
        for (let m in map_meshes)
          this.scene.add(map_meshes[m])
      })
      .then(() =>{
        this.$http.get('/api/coordenadas/ufs')
          .then(response => { return response.json() }, err)
          .then(points =>{
            for (let i = 0; i < points.ufs.length; i++)
              points.ufs[i].tamanho = Math.min(points.ufs[i].tamanho*10, 75)
            
            this.ufs = points.ufs
            this.ufs_cloud = this.$_map_generate_point_cloud(points.ufs)
            this.scene.add(this.ufs_cloud)
            this.ufs_cloud.material.uniforms.opacity.value = 0.25

            this.$_map_animate()
            this.loadedMap = true
            this.$emit('loadedMap')
          })
          .catch(() => { this.failedToLoad = true; this.$emit('failedToLoad')})
      })
      .catch(() => { this.failedToLoad = true; this.$emit('failedToLoad')})
  },
}
</script>

<style scoped>
  #container {
    margin: 0;
    min-width: 100%;
    min-height: 100%;
    overflow: hidden;
    position: absolute;
  }

  #mapCanvas {
    position: absolute;
  }

  #colormap {
    max-width:50%; 
    height:60px;
    position: absolute;
    bottom: 74px;
    right: 1.5%;
  }

  .label {
    position: absolute;
    font-size: small;
    color: black;
    text-shadow: -1px 0 white, 0 1px white, 1px 0 white, 0 -1px white;
  }
</style>
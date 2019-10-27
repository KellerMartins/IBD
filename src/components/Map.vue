<template>
  <div v-resize="$_map_resize" id="container"></div>
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

export default {
  name: 'ThreeTest',
  data() {
    return {
      camera: null,
      scene: null,
      renderer: null,
    }
  },
  methods: { 
    //------------------------------------------// Public Methods
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
      this.$_map_resetSelectionSphere()
      this.$emit('clearedSelection')
    },


    //TODO: Figure out a correct conversion between coordinate systems
    sphericalToCartesian: function (pos) {
      var phi = -pos.x;
      var theta = pos.y;
      var r = pos.hasOwnProperty('z')? pos.z : 100;
      var x = r * Math.sin(phi) * Math.cos(theta)
      var z = r * Math.sin(phi) * Math.sin(theta)
      var y = r * Math.cos(phi)
      return new THREE.Vector3(-x, y, z)
    },

    geographicToCartesian: function (pos) {
      var geo = new THREE.Vector3((pos.x-90)*Math.PI/180, 
                                  (pos.y+90)*Math.PI/180, 
                                  pos.hasOwnProperty('z')? pos.z : 100);
      return this.sphericalToCartesian(geo)
    },

    cartesianToSpherical: function (pos) {
      var rho = Math.sqrt(pos.x*pos.x + pos.y*pos.y + pos.z*pos.z)
      var theta = Math.atan(pos.z/-pos.x)
      var phi = -Math.acos(pos.y/rho)
      return new THREE.Vector2(phi, theta)
    },

    cartesianToGeographic: function (pos) {
      var sph = this.cartesianToSpherical(pos)
      return new THREE.Vector2(sph.x*180/Math.PI + 90, sph.y*180/Math.PI - 90)
    },

    cartesianToScreen: function (pos) {
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


      this.raycaster = new THREE.Raycaster()
      this.mouse = new THREE.Vector2()

      this.coord_move = new THREE.Vector2()
      this.coord_start = new THREE.Vector2()
      this.coord_end = new THREE.Vector2()

      this.intersection_sphere
      this.selecting = false
      this.selectionMode = false


      var geometry = new THREE.SphereGeometry( 0.1, 4, 4)
      var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide, opacity:0.75, transparent:true, depthTest:false} )
      this.sphere_region = new THREE.Mesh( geometry, material )
      this.scene.add(this.sphere_region)

      document.addEventListener('mousemove', this.$_map_onDocumentMouseMove, false)
      document.addEventListener('mousedown', this.$_map_onDocumentMouseDown, false)
      document.addEventListener('mouseup', this.$_map_onDocumentMouseUp, false)
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
      this.selection_start_obj.visible = this.selectionMode && this.selecting

      if (Date.now() > this.lastMoved + this.movedEventDelay &&
          (this.camera.position.x != this.lastCameraPosition.x ||
           this.camera.position.y != this.lastCameraPosition.y ||
           this.camera.position.z != this.lastCameraPosition.z)) {
        this.lastCameraPosition.x = this.camera.position.x
        this.lastCameraPosition.y = this.camera.position.y
        this.lastCameraPosition.z = this.camera.position.z

        this.$emit('moved')
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
      }
    },

    $_map_onDocumentMouseDown: function (event) {
      event.preventDefault()
      if (event.button === 2 || this.selectionMode) {

        var intersect = this.$_map_getMouseIntersection()
        if (intersect) {
          if (!this.selecting) {
            this.coord_start = this.cartesianToSpherical(intersect)
            this.selecting = true
            this.selection_start_obj.position = intersect;
          } else{
            this.selecting = false
            this.disableSelectionMode()
            this.coord_end = this.cartesianToSpherical(intersect)
            if (this.coord_start.distanceTo(this.coord_end) > 0) {
              this.$_map_changeSelectionSphere(this.coord_start, this.coord_end)
              this.$emit('selected', this.coord_start, this.coord_end)
            } else {
              this.clearSelection()
            }
          }
        }
      }
    },

    $_map_onDocumentMouseMove: function (event) {
      event.preventDefault()

      var rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x =   ((event.clientX - rect.left) / window.innerWidth ) * 2 - 1;
      this.mouse.y = - ((event.clientY - rect.top) / window.innerHeight ) * 2 + 1;

      if (!this.selectionMode) {
        var intersect = this.$_map_getMouseIntersection()
        if (intersect) {

          if (this.selecting) {
            this.coord_move = this.cartesianToSpherical(intersect)
            if (this.coord_start.distanceTo(this.coord_move) > 0)
              this.$_map_changeSelectionSphere(this.coord_start, this.coord_move)
          }
        }
      }
    },

    $_map_onDocumentMouseUp: function (event) {
      event.preventDefault()
      if (event.button === 2 && !this.selectionMode) {

        var intersect = this.$_map_getMouseIntersection()
        if (intersect) {
          this.selecting = false
          this.coord_end = this.cartesianToSpherical(intersect)
          if (this.coord_start.distanceTo(this.coord_end) > 0) {
            this.$_map_changeSelectionSphere(this.coord_start, this.coord_end)
            this.$emit('selected', this.coord_start, this.coord_end)
          } else {
            this.clearSelection()
          }
        }
      }
    },


    $_map_getMouseIntersection: function() {
      if (this.intersection_sphere) {
        this.raycaster.setFromCamera( this.mouse, this.camera )
        // calculate objects intersecting the picking ray
        var inters = this.raycaster.intersectObject(this.intersection_sphere)
        if (inters.length > 0)
          return inters[0].point
        
      } else {
        this.intersection_sphere = new THREE.Mesh( new THREE.SphereGeometry( 100, 32, 32 ), new THREE.MeshBasicMaterial( {color: 0xffff00} ))
      }

      return false
    },

    $_map_changeSelectionSphere: function (start, end) {
      var phi_min = Math.min(start.y, end.y)
      var phi_max = Math.max(start.y, end.y)
      var theta_min = Math.min(start.x, end.x)
      var theta_max = Math.max(start.x, end.x)

      var geometry = new THREE.SphereGeometry( 100, 8, 8, 
        start.y, (phi_max-phi_min) * Math.sign(end.y-start.y),
        -start.x, (theta_max-theta_min) * Math.sign(start.x-end.x))
      this.sphere_region.geometry.dispose()
      this.sphere_region.geometry = geometry
    },

    $_map_resetSelectionSphere: function() {
      var geometry = new THREE.SphereGeometry( 0.1, 4, 4)
      this.sphere_region.geometry.dispose()
      this.sphere_region.geometry = geometry
    },



    $_map_generate_point_cloud: function (points) {
      var vertices = [];
      var point_sizes =  [];
      var heights = [];
      for(let i = 0; i < points.length; i++) {
        var point = points[i];
        var r = 100 + point[2]/1000;
        vertices.push(this.geographicToCartesian(new THREE.Vector3(point[1], point[0], r)));
        point_sizes.push(point[3]);
        heights.push(point[2]);
      }

      var positions = new Float32Array( vertices.length * 3 );
      var colors = new Float32Array( vertices.length * 3 );
      var sizes = new Float32Array( vertices.length );

      var vertex;
      var color = new THREE.Color();

      for (let i = 0, l = vertices.length; i < l; i++) {
        vertex = vertices[ i ];
        vertex.toArray( positions, i * 3 );

        var t = clamp(heights[i]/1000, 0, 1);
        color.setRGB((t*66  + (1-t)*181 + (t*t*t)*90 )/255, 
                      (t*237 + (1-t)*247 + (t*t*t)*237)/255, 
                      (t*109 + (1-t)*12  + (t*t*t)*210)/255);

        color.toArray( colors, i * 3 );

        sizes[ i ] = Math.pow(point_sizes[i],1.25)*8;
      }

      var geometry = new THREE.BufferGeometry();
      geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
      geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
      geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );

      var spriteTex = new THREE.TextureLoader().load("/disc.png");
      var material = new THREE.ShaderMaterial( {
        uniforms: {
          color: { value: new THREE.Color( 0xffffff ) },
          pointTexture: { value: spriteTex }
        },
        vertexShader: `
        attribute float size;
        attribute vec3 customColor;

        varying vec3 vColor;
        varying float fade;

        void main() {
            vColor = customColor;
            vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

            fade = clamp(( 30.0 / -mvPosition.z ), 0.0, 1.0);
            gl_PointSize = size * ( 20.0 / -mvPosition.z );
            gl_Position = projectionMatrix * mvPosition;
        }`,
        fragmentShader:`
        uniform vec3 color;
        uniform sampler2D pointTexture;

        varying vec3 vColor;
        varying float fade;

        void main() {
          vec4 tex = texture2D(pointTexture, gl_PointCoord);
          gl_FragColor = vec4(color * vColor * ((1.0-fade)*vec3(0.8,0.8,0.8) + fade*tex.rgb), tex.a);
        }`,
        transparent: true,
        depthTest: false
      } );

      var city_cloud = new THREE.Points( geometry, material );
      this.scene.add(city_cloud);



      geometry = new THREE.BufferGeometry();
      geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array([0,0,0]), 3 ) );
      geometry.addAttribute( 'customColor', new THREE.BufferAttribute( new Float32Array([2,2,0]), 3 ) );
      geometry.addAttribute( 'size', new THREE.BufferAttribute( new Float32Array([100]), 1 ) );
      this.selection_start_obj = new THREE.Points( geometry, material );
      this.scene.add(this.selection_start_obj);



      var map_contour = getContour(points, vertices);
      var map_outline_geo = new THREE.Geometry();
      for (let i = 0; i < map_contour.length-1; i++){
        map_outline_geo.vertices.push(new THREE.Vector3( map_contour[i].vx, map_contour[i].vy, map_contour[i].vz+0.01) );
      }
      this.scene.add(new THREE.LineLoop(map_outline_geo, new THREE.LineBasicMaterial( { color: 0x000000, linewidth: 3 } ) ) );



      var map_geo = geometryFromContour(map_contour);
      var map_mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xcaed72),
        side: THREE.DoubleSide,
      })
      this.scene.add(new THREE.Mesh(map_geo, map_mat));



      function geometryFromContour( contour ){
        contour.pop()
        var tris = new poly2tri.SweepContext(contour).triangulate().getTriangles();
        var geo = new THREE.Geometry();

        for( var i = 0 ; i < tris.length ; i++ ){
          
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

      function getContour( points, vecs ){
        var temp_points = points.map((a, i) => ({index:i, x:a[1], y:a[0], vx:vecs[i].x, vy:vecs[i].y, vz:vecs[i].z}));
        var h = hull(temp_points, 3, ['.x', '.y']);
        return h
      }
    },
  },
  mounted() {
    this.$_map_init()
    this.$http.get('/points.json').then(data => {
      const points = data.body
      this.$_map_generate_point_cloud(points);
      this.$_map_animate();
      this.$emit('loadedMap')
    })
  },
}
</script>

<style scoped>
  #container {
    margin: 0;
    min-width: 100%;
    min-height: 100%;
    overflow:hidden;
    position: absolute;
  }

  #mapCanvas {
    position: absolute;
  }
</style>
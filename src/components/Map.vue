<template>
  <div v-resize="resize" id="container"></div>
</template>

<script>
import * as THREE from 'three'
import OrbitControls from 'three-orbitcontrols'
import poly2tri from 'poly2tri'
import hull from '@/plugins/hull.js'

export default {
  name: 'ThreeTest',
  data() {
    return {
      camera: null,
      scene: null,
      renderer: null,
      mesh: null,
      loaded: false,
    }
  },
  methods: {
    init: function() {
      let container = document.getElementById('container')

      this.camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 1200 )
      this.camera.position.x = -194
      this.camera.position.y = -47
      this.camera.position.z = 151
      this.camera.rotation = new THREE.Euler( 0.3043099695380036,
                                             -0.8860184479114381,
                                              0.2386270538109674, 'XYZ')

      this.controls = new OrbitControls(this.camera)
      this.controls.minAzimuthAngle = -1.2505353212390744
      this.controls.maxAzimuthAngle = -0.5880577929697266
      this.controls.minPolarAngle = 1.514093521249383
      this.controls.maxPolarAngle = 1.9984931877969334
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


      this.raycaster = new THREE.Raycaster()
      this.mouse = new THREE.Vector2()

      this.coord_move = new THREE.Vector2()
      this.coord_start = new THREE.Vector2()
      this.coord_end = new THREE.Vector2()

      this.intersection_sphere
      this.selecting = false


      var geometry = new THREE.SphereGeometry( 0.1, 4, 4)
      var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide, opacity:0.75, transparent:true} )
      this.sphere_region = new THREE.Mesh( geometry, material )
      this.scene.add(this.sphere_region)

      document.addEventListener('mousemove', this.onDocumentMouseMove, false)
      document.addEventListener('mousedown', this.onDocumentMouseDown, false)
      document.addEventListener('mouseup', this.onDocumentMouseUp, false)

    },
    animate: function() {
      requestAnimationFrame(this.animate)
      var p = this.camera.position
      var dist = Math.sqrt(p.x*p.x + p.y*p.y + p.z*p.z)
      var k = (dist-this.controls.minDistance) / (this.controls.maxDistance - this.controls.minDistance)
      this.controls.rotateSpeed = k*0.16 + (1-k)*0.0125

      this.controls.update()
      this.renderer.render(this.scene, this.camera)
    },
    resize: function() {
      if (this.renderer && this.camera) {
        if (typeof this.portrait !== 'undefined'){
          var isMobile = (function(a){return (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(a.substr(0,4)))})(navigator.userAgent||navigator.vendor||window.opera);
          if (isMobile && this.portrait == window.innerWidth < window.innerHeight)
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
    cartesianToSpherical: function (pos) {
      var rho = Math.sqrt(pos.x*pos.x + pos.y*pos.y + pos.z*pos.z)
      var theta = Math.atan(pos.z/pos.x)
      var phi = Math.acos(pos.y/rho)
      return new THREE.Vector2(phi, theta)
    },
    changeSelectionSphere: function (start, end) {
        var phi_min = Math.min(start.y, end.y)
        var phi_max = Math.max(start.y, end.y)
        var theta_min = Math.min(start.x, end.x)
        var theta_max = Math.max(start.x, end.x)

        var geometry = new THREE.SphereGeometry( 102, 8, 8, 
          -start.y, (phi_max-phi_min) * Math.sign(start.y-end.y),
        start.x, (theta_max-theta_min) * Math.sign(end.x-start.x))
        this.sphere_region.geometry.dispose()
        this.sphere_region.geometry = geometry
    },
    onDocumentMouseDown: function (event) {
      event.preventDefault()
      if (event.button === 2) {

        var intersect = this.getMouseIntersection()
        if (intersect) {
          this.coord_start = this.cartesianToSpherical(intersect)
          this.selecting = true
        }
      }
    },
    onDocumentMouseMove: function (event) {
      event.preventDefault()
      var rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x =   ((event.clientX - rect.left) / window.innerWidth ) * 2 - 1;
      this.mouse.y = - ((event.clientY - rect.top) / window.innerHeight ) * 2 + 1;

      var intersect = this.getMouseIntersection()
      if (intersect) {

        if (this.selecting) {
          this.coord_move = this.cartesianToSpherical(intersect)
          this.changeSelectionSphere(this.coord_start, this.coord_move)
        }
      }
    },
    onDocumentMouseUp: function (event) {
      event.preventDefault()
      if (event.button === 2) {

        var intersect = this.getMouseIntersection()
        if (intersect) {
          this.coord_end = this.cartesianToSpherical(intersect)
          this.changeSelectionSphere(this.coord_start, this.coord_end)
          this.selecting = false
        }
      }
    },
    getMouseIntersection: function () {
      if (this.intersection_sphere) {
        this.raycaster.setFromCamera( this.mouse, this.camera )
        // calculate objects intersecting the picking ray
        var inters = this.raycaster.intersectObject(this.intersection_sphere)
        if (inters.length > 0)
          return inters[0].point
        
      } else {
        this.intersection_sphere = new THREE.Mesh( new THREE.SphereGeometry( 103, 32, 32 ), new THREE.MeshBasicMaterial( {color: 0xffff00} ))
      }

      return false
    },
    clamp: function (number, min, max) {
      return Math.max(min, Math.min(number, max));
    },
    generate_point_cloud: function (points) {
      var vertices = [];
      var point_sizes =  [];
      var heights = [];
      for(let i = 0; i < points.length; i++) {
        var point = points[i];
        var lat = -point[1];
        var lon = point[0];
        var r = 100 + point[2]/1000;
        var x = r * Math.sin((lon) * Math.PI/180) * Math.cos((lat) * Math.PI/180)
        var y = r * Math.sin((lon) * Math.PI/180) * Math.sin((lat) * Math.PI/180)
        var z = r * Math.cos((lon) * Math.PI/180)
        vertices.push(new THREE.Vector3(x, y, z));
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

        var t = this.clamp(heights[i]/1000, 0, 1);
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
    this.init()
    this.$http.get('/points.json').then(data => {
      const points = data.body
      this.generate_point_cloud(points);
      this.animate();
      this.loaded = true;
    })
  },
}
</script>

<style>
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
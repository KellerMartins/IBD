<template>
  <div v-resize="resize" id="container"></div>
</template>

<script>
import * as Three from 'three'

export default {
  name: 'ThreeTest',
  data() {
    return {
      camera: null,
      scene: null,
      renderer: null,
      mesh: null
    }
  },
  methods: {
    init: function() {
        let container = document.getElementById('container')

        this.camera = new Three.PerspectiveCamera(70, container.clientWidth/container.clientHeight, 0.01, 10)
        this.camera.position.z = 1

        this.scene = new Three.Scene()

        let geometry = new Three.BoxGeometry(0.2, 0.2, 0.2)
        let material = new Three.MeshNormalMaterial()

        this.mesh = new Three.Mesh(geometry, material)
        this.scene.add(this.mesh)

        this.renderer = new Three.WebGLRenderer({antialias: true})
        this.renderer.setSize(container.clientWidth, container.clientHeight)
        container.appendChild(this.renderer.domElement)

    },
    animate: function() {
        requestAnimationFrame(this.animate)
        this.mesh.rotation.x += 0.01
        this.mesh.rotation.y += 0.02
        this.renderer.render(this.scene, this.camera)
    },
    resize: function() {
      if (this.renderer && this.camera) {
        var width = window.innerWidth
        var height = window.innerHeight
        this.camera.aspect = width / height
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(width, height)
        /* eslint-disable no-console */
        console.log(width, height)
        /* eslint-enable no-console */
      }
    }
  },
  mounted() {
    this.init()
    this.animate()
  },
}
</script>

<style scoped>
#container {
  margin: 0;
  width: 100%;
  height: 100%;
  overflow:hidden;
  position: absolute;
}
</style>
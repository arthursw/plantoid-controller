// import io from 'socket.io-client';
// import('./libs/zlib.min.js');

// var THREE = require('three');
// var zlib = require('zlib');
// import("three/examples/js/controls/OrbitControls.js");
// import("three/examples/js/curves/NURBSCurve.js");
// import("three/examples/js/curves/NURBSUtils.js");
// import("three/examples/js/loaders/FBXLoader.js");
// let Detector = require("three/examples/js/Detector.js");
// import("three/examples/js/libs/stats.min.js");

// import("./libs/threejs/three.js");
// import("./libs/threejs-libs/controls/OrbitControls.js");
// import("./libs/threejs-libs/curves/NURBSCurve.js");
// import("./libs/threejs-libs/curves/NURBSUtils.js");
// import("./libs/threejs-libs/loaders/FBXLoader.js");
// import("./libs/threejs-libs/Detector.js");
// import("./libs/threejs-libs/libs/stats.min.js");


let THREE = window.THREE;
let io = window.io;
let Detector = window.Detector;
let Stats = window.Stats;

let simulateSockets = true;

export function main(component) {

	var socket = io('http://localhost:6843');
	
	socket.on('connected', ()=> simulateSockets = false );


	// socket.on('news', function (data) {
	// 	console.log(data);
	// 	socket.emit('my other event', { my: 'data' });
	// });

	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

	var container, stats, controls;
	var camera, scene, renderer, light;
	var uniforms;
	var PARTICLE_SIZE = 20;
	var raycaster;
	var INTERSECTED;

	let ledStripConfigs = [
		{ name: 'led-strip-r', nLeds: 100},
		{ name: 'led-strip-l', nLeds: 100},
		{ name: 'led-strip-stem-l', nLeds: 100},
		{ name: 'led-strip-stem-r', nLeds: 100},
		{ name: 'led-strip-leaf-l', nLeds: 100},
		{ name: 'led-strip-leaf-r', nLeds: 100},
		{ name: 'led-strip-petals', nLeds: 600},
	];
	let ledStrips = [];

	init();
	animate();

	function setLedStripData(data) {
		let ledStrip = ledStrips.find((ledStrip)=>ledStrip.name == data.name)
		let geometry = ledStrip.geometry;
		if(geometry.attributes.color.array.length == data.values.length) {
			let nLeds = ledStrip.nLeds;
			geometry.attributes.color.array = new Float32Array(data.values);
			geometry.attributes.color.needsUpdate = true;
		}
	}

	function init() {

		container = document.createElement( 'div' );
		document.body.appendChild( container );

		camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
		camera.position.set( 2, 18, 28 );

		controls = new THREE.OrbitControls( camera, container );
		controls.target.set( 0, 12, 0 );
		controls.update();

		raycaster = new THREE.Raycaster();
		raycaster.params.Points.threshold = 0.1;

		scene = new THREE.Scene();

		light = new THREE.HemisphereLight( 0xffffff, 0x444444 );
		light.position.set( 0, 1, 0 );
		scene.add( light );

		light = new THREE.DirectionalLight( 0xffffff );
		light.position.set( 0, 1, 0 );
		scene.add( light );

		// grid
		var gridHelper = new THREE.GridHelper( 28, 28, 0x303030, 0x303030 );
		scene.add( gridHelper );

		// stats
		stats = new Stats();
		container.appendChild( stats.dom );

		uniforms = {
			texture:   { value: new THREE.TextureLoader().load( "textures/lensflare.png" ) }
		};

		var shaderMaterial = new THREE.ShaderMaterial( {
			uniforms:       uniforms,
			vertexShader:   document.getElementById( 'vertexshader' ).textContent,
			fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
			blending:       THREE.AdditiveBlending,
			depthTest:      false,
			transparent:    true,
			vertexColors:   true
		});

		// model
		var loader = new THREE.FBXLoader();
		loader.load( 'models/plantoid.fbx', function( object ) {

			let overrideMaterial = new THREE.MeshLambertMaterial({color: 0xffffff, transparent: true, opacity: 0.25});
			


			for(let child of object.children) {
				
				child.material = overrideMaterial;

				let config = ledStripConfigs.find((config)=> config.name == child.name)
				if(config) {
					
					let geometry = new THREE.BufferGeometry();
					// geometry.addAttribute( 'position', child.geometry.attributes.position );
					var color = new THREE.Color();
					let nVertices = child.geometry.attributes.position.count;
					let colors = [];
					var sizes = [];
					let positions = [];
					// let matrix = child.matrix.getInverse(child.matrix, true);
					let matrix = new THREE.Matrix4();
					matrix.makeTranslation(0, 0.1, 0);

					let vertices = [];

					for ( var i = 0; i < nVertices ; i ++ ) {
						if(i%6>0) {
							continue;
						}
						let x = child.geometry.attributes.position.array[3*i+0];
						let y = child.geometry.attributes.position.array[3*i+1];
						let z = child.geometry.attributes.position.array[3*i+2];
						let v = new THREE.Vector3(x, y, z);
						v.multiplyScalar(0.35);
						v.applyMatrix4(matrix);
						vertices.push(v);
					}

					for ( var i = 0; i < config.nLeds ; i ++ ) {
						let indexF = (i / config.nLeds) * vertices.length;
						let indexI = Math.floor(indexF);
						let f = indexF - indexI;
						
						let vi = vertices[indexI].clone();
						let v = vi;
						
						if(indexI+1 < vertices.length) {
							let vip1 = vertices[indexI+1].clone();
							v = vi.multiplyScalar(1-f).add(vip1.multiplyScalar(f));
						}

						positions.push(v.x, v.z, v.y);

						color.setHSL( i / config.nLeds, 1.0, 0.5 );
						colors.push( color.r, color.g, color.b );
						sizes.push( 20 );
					}
					console.log(matrix);

					geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ).setDynamic( true ) );			
					geometry.addAttribute( 'size', new THREE.Float32BufferAttribute( sizes, 1 ).setDynamic( true ) );		
					geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ));

					// let size   = 5;
					// let material = new THREE.PointsMaterial( { size: size, map: sprite, blending: THREE.AdditiveBlending, depthTest: false, transparent : true } );
					// material.color.setHSL( color[ 0 ], color[ 1 ], color[ 2 ] );
					// var particles = new THREE.Points( geometry, material );

					let particleSystem = new THREE.Points( geometry, shaderMaterial );
					scene.add( particleSystem );

					let stripSocket = io('http://localhost:6843/');
					stripSocket.emit('join', config.name);

					stripSocket.on('data', setLedStripData);


					ledStrips.push({name: config.name, geometry: geometry, nLeds: config.nLeds, points: particleSystem});

				}
			}

			scene.add( object );

		} );

		renderer = new THREE.WebGLRenderer();
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		container.appendChild( renderer.domElement );

		window.addEventListener( 'resize', onWindowResize, false );
		renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );

	}

	function onWindowResize() {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

	}

	//

	function animate() {

		requestAnimationFrame( animate );

		render();

		stats.update();

	}

	function render() {
		// for(let ledStrip of ledStrips) {
			
		// 	let geometry = ledStrip.geometry;
		// 	let nLeds = ledStrip.nLeds;

		// 	if(geometry && geometry.attributes.size && geometry.attributes.color) {

		// 		// var time = Date.now() * 0.005;
		// 		// var sizes = geometry.attributes.size.array;
		// 		// var colors = geometry.attributes.color.array;
		// 		// for ( var i = 0; i < nLeds ; i++ ) {
		// 		// 	sizes[ i ] = 10 * ( 1 + Math.sin( 0.1 * i + time ) );
		// 		// 	colors[ i * 3 + 0] = (Math.sin( 0.1 * i + time ) + 1)/2;
		// 		// 	colors[ i * 3 + 1] = (Math.sin( 0.1 * i + time ) + 1)/2;
		// 		// 	colors[ i * 3 + 2] = (Math.sin( 0.1 * i + time ) + 1)/2;
		// 		// }
		// 		// geometry.attributes.size.needsUpdate = true;
		// 		// geometry.attributes.color.needsUpdate = true;
		// 	}

		// }
		renderer.render( scene, camera );

		let time = Date.now() * 0.001;
		let step = 1;

		for(let ledStrip of ledStrips) {
			let values = [];

			for(let i=0 ; i<ledStrip.nLeds ; i++) {
				
				// let config = component.state.strips[ledStrip.name];

				// if(config.type == 'color') {

				// }
				// let frequency = config.frequency;
				// let color1 = config.color1;
				// let color2 = config.color2;
				// let mask = JSON.parse(config.mask) | [];
				// if(mask.indexOf(i) >= 0) {
				// 	values.push(0, 0, 0);
				// }
				// let type = config.type;
				// let t = time + i * step;
				// let func = type == 'sine' ? Math.sin : type == 'triangle' ? triangle : square;
				// let value = 0.5 + 0.5 * func(2 * Math.PI * frequency * t);
				
				// for(let c of ['red', 'green', 'blue']) {
				// 	let color = color1[c] * (1-value) + color2[c] * value;
				// 	values.push(color);
				// }

				values.push(...component.computeValues(ledStrip.name, i, ledStrip.nLeds));
			}
			let data = { name: ledStrip.name, values: values };
			
			if(simulateSockets) {
				setLedStripData(data);
			} else {
				socket.emit('data', data);
			}
		}
	}


	function onDocumentMouseDown( event ) {
		event.preventDefault();
		let mouse = new THREE.Vector2();
		
		mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

		raycaster.setFromCamera( mouse, camera );

		for(let ledStrip of ledStrips) {

			var geometry = ledStrip.geometry;
			var attributes = geometry.attributes;

			var intersects = raycaster.intersectObject( ledStrip.points );
			
			

			if ( intersects.length > 0 ) {
				
				component.toggleMask(ledStrip.name, intersects[ 0 ].index)

				// socket.emit('my other event', { my: 'data' });

			// 	if ( INTERSECTED != intersects[ 0 ].index ) {
			// 		attributes.size.array[ INTERSECTED ] = PARTICLE_SIZE;
			// 		INTERSECTED = intersects[ 0 ].index;
			// 		attributes.size.array[ INTERSECTED ] = PARTICLE_SIZE * 10.25;
			// 		attributes.size.needsUpdate = true;
			// 	}
			// 	break;
			// } else if ( INTERSECTED !== null ) {
			// 	attributes.size.array[ INTERSECTED ] = PARTICLE_SIZE;
			// 	attributes.size.needsUpdate = true;
			// 	INTERSECTED = null;
			// 	break;
			}

		}

	}

}

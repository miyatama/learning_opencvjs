import * as THREE from './three.module.js';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
 
window.addEventListener('load',function(){
   init();
});
 
let scene,camera,renderer;
let fish, fishAnimationMixer, fishMesh, fishFinMesh;
let clock = new THREE.Clock();

function init() {
    loadPainting();

    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#appCanvas')
    });
    renderer.setSize(width, height);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
    camera.position.set(0, 0, 20);

    const gltfLoader = new GLTFLoader();
    gltfLoader.load("fish/fish.gltf", function (model) {
        fish = model
        fishAnimationMixer = new THREE.AnimationMixer(fish.scene);
        fish.animations.forEach((clip) => {
            fishAnimationMixer.clipAction(clip).play();
        });
        for(let i = 0; i < fish.scene.children.length; i++) {
            let mesh = fish.scene.children[i]
            if(mesh.isMesh) {
                fishMesh = mesh;
                for(let j = 0; j < mesh.children.length; j++){
                    if(mesh.children[j].isMesh) {
                        fishFinMesh = mesh.children[j];
                    }
                }
            }
        }
        scene.add(fish.scene);
    });

    const directionalLight = new THREE.DirectionalLight(0xFFFFFF);
    directionalLight.position.set(0, 0, 1);
    scene.add(directionalLight);

    const btnTextureChanged = document.getElementById("btnTextureChanged");
    btnTextureChanged.addEventListener("click", updateFishTexture);
    const btnDrawTextureChanged = document.getElementById("btnDrawTextureChanged");
    btnDrawTextureChanged.addEventListener("click", updateDrawFishTexture);

    rendering();
}

function rendering() {
    let delta = clock.getDelta();
    if (fishAnimationMixer) fishAnimationMixer.update(delta);
    renderer.render(scene, camera);
    requestAnimationFrame(rendering);
}

function updateFishTexture() {
    const texture = new THREE.TextureLoader().load("./fish/fish_texture2.png");
    console.log(texture);
    texture.flipY = false;
    fishMesh.material.map = texture;
    fishMesh.material.needsUpdate = true;
    fishFinMesh.material.map = texture;
    fishFinMesh.material.needsUpdate = true;
}

function updateDrawFishTexture() {
    const texture = new THREE.CanvasTexture(imageCvs);
    texture.flipY = false;
    fishMesh.material.map = texture;
    fishMesh.material.needsUpdate = true;
    fishFinMesh.material.map = texture;
    fishFinMesh.material.needsUpdate = true;
}

/*
* お絵描き
*/
var mode = "1";
var inputType = "1";
var canvasRgba = "rgba(0, 0, 0, 1)";
var brushSize = 10;
var alpha = 1;
var holdClick = false;
var startX = 0;
var startY = 0;
var zoomRario = 1;

var imageCvs = document.getElementById("imageCanvas");
var imageCtx = imageCvs.getContext("2d");
var drawTempCvs = document.getElementById("drawTempCanvas");
var drawTempCtx = drawTempCvs.getContext("2d");
var pointerCvs = document.getElementById("pointerCanvas");
var pointerCtx = pointerCvs.getContext("2d");

function loadPainting() {
    pointerCvs.addEventListener("mousedown", mouseDown);
    pointerCvs.addEventListener("mousemove", mouseMove);
    pointerCvs.addEventListener("mouseup", mouseUp);
    pointerCvs.addEventListener("mouseout", function (e) {
        pointerCtx.clearRect(0, 0, imageCvs.width, imageCvs.height)
        if (holdClick) {
            mouseUp(e);
        }
    });
}

$(function () {
    $('[name="mode"]').on('change', function (e) {
        mode = $('input[name="mode"]:checked').val();

        if (mode == "1") {
            $("#input-type-area").show();
            $("#size-area").show();
            $("#transparent-area").show();
            $("#range-area").show();
            $("#color-picker-area").show();
        } else if (mode == "2") {
            $("#input-type-area").hide();
            $("#size-area").show();
            $("#transparent-area").hide();
            $("#range-area").show();
            $("#color-picker-area").hide();
        } else {
            $("#input-type-area").hide();
            $("#size-area").hide();
            $("#transparent-area").hide();
            $("#range-area").hide();
            $("#color-picker-area").hide();
        }
    });
});

$(function () {
    $('[name="input-type"]').on('change', function (e) {
        inputType = $('input[name="input-type"]:checked').val();
    });
});

$(function () {
    $('#colorPicker').on('change', function (e) {
        $(this).val(e.detail[0]);
        canvasRgba = "rgba(" +
            parseInt(e.detail[0].substring(1, 3), 16) + ", " +
            parseInt(e.detail[0].substring(3, 5), 16) + ", " +
            parseInt(e.detail[0].substring(5, 7), 16) + ", " +
            alpha + ")";
    });
});

$(function () {
    $('#uploadFile').on('change', function (e) {
        var file = e.target.files[0];
        if (file.type.indexOf("image") < 0) {
            alert("画像ファイルを指定してください。");
            return false;
        }

        var reader = new FileReader();
        reader.onload = (function (file) {
            return function (e) {
                image(e.target.result);
                $("#explanation").hide();
                zoomRario = 1;
                zoom();
            };
        })(file);
        reader.readAsDataURL(file);
    });
});

function sizeChange(num) {
    document.getElementById("size").innerHTML = num;
    brushSize = num;
}

function alphaChange(num) {
    document.getElementById("transparent").innerHTML = num;
    alpha = num;

    var temp = canvasRgba.replace("rgba(", "").replace(")", "").split(",");
    canvasRgba = "rgba(" +
        temp[0] + ", " +
        temp[1] + ", " +
        temp[2] + ", " +
        num + ")"
}

function mouseDown(e) {
    holdClick = true;
    startX = e.offsetX;
    startY = e.offsetY;
}

function mouseMove(e) {
    document.getElementById("dispX").innerHTML = e.offsetX;
    document.getElementById("dispY").innerHTML = e.offsetY;

    if (mode == "1") {
        if (inputType == "1" || inputType == "2") { // 描き込みタイプ：ペン or 直線
            pointer(e);
        }

        if (holdClick) {
            if (inputType == "1") { // 描き込みタイプ：ペン
                drawPen(e);
            } else if (inputType == "2") { // 描き込みタイプ：直線
                drawLine(e);
            } else if (inputType == "3") { // 描き込みタイプ：短径
                drawRect(e);
            } else if (inputType == "4") { // 描き込みタイプ：円
                drawArc(e);
            }
        }
    } else if (mode == "2") {
        pointer(e);
        if (holdClick) {
            drawErase(e);
        }
    } else {
        if (holdClick) {
            imageMove(e);
        }
    }
}

function mouseUp(e) {
    holdClick = false;
    if (mode == "1") {
        if (inputType == "1") {
            drawPen(e);
        } else if (inputType == "2") {
            drawLine(e);
        } else if (inputType == "3") {
            drawRect(e);
        } else if (inputType == "4") {
            drawArc(e);
        }
    } else if (mode == "2") {
        drawErase(e);
    }
}

function drawPen(e) {
    imageCtx.lineWidth = brushSize;
    imageCtx.strokeStyle = canvasRgba;
    imageCtx.lineJoin = "round";
    imageCtx.lineCap = "round";
    imageCtx.globalCompositeOperation = 'source-over';
    imageCtx.beginPath();
    imageCtx.moveTo(startX, startY);
    imageCtx.lineTo(e.offsetX, e.offsetY);
    imageCtx.stroke();
    imageCtx.closePath();

    startX = e.offsetX;
    startY = e.offsetY;
}

function drawLine(e) {
    drawTempCtx.clearRect(0, 0, imageCvs.width, imageCvs.height)
    if (holdClick) {
        targateCtx = drawTempCtx;
    } else {
        targateCtx = imageCtx;
    }

    targateCtx.lineWidth = brushSize;
    targateCtx.strokeStyle = canvasRgba;
    targateCtx.lineCap = "round";
    targateCtx.globalCompositeOperation = 'source-over';
    targateCtx.beginPath();
    targateCtx.moveTo(startX, startY);
    targateCtx.lineTo(e.offsetX, e.offsetY);
    targateCtx.stroke();
    targateCtx.closePath();
}

function drawRect(e) {
    drawTempCtx.clearRect(0, 0, imageCvs.width, imageCvs.height)
    if (holdClick) {
        targateCtx = drawTempCtx;
    } else {
        targateCtx = imageCtx;
    }

    targateCtx.fillStyle = canvasRgba;
    targateCtx.globalCompositeOperation = 'source-over';

    targateCtx.beginPath();
    targateCtx.fillRect(startX, startY, e.offsetX - startX, e.offsetY - startY);
    targateCtx.closePath();
}

function drawArc(e) {
    drawTempCtx.clearRect(0, 0, imageCvs.width, imageCvs.height)
    if (holdClick) {
        targateCtx = drawTempCtx;
    } else {
        targateCtx = imageCtx;
    }

    targateCtx.fillStyle = canvasRgba;
    targateCtx.globalCompositeOperation = 'source-over';

    var centerX = Math.max(startX, e.offsetX) - Math.abs(startX - e.offsetX) / 2;
    var centerY = Math.max(startY, e.offsetY) - Math.abs(startY - e.offsetY) / 2;
    var distance = Math.sqrt(Math.pow(startX - e.offsetX, 2) + Math.pow(startY - e.offsetY, 2));

    targateCtx.beginPath();
    targateCtx.arc(centerX, centerY, distance / 2, 0, Math.PI * 2, true);
    targateCtx.fill();
    targateCtx.closePath();
}

function drawErase(e) {
    imageCtx.lineWidth = brushSize;
    imageCtx.lineCap = "round";
    imageCtx.strokeStyle = "rgba(255, 255, 255, 1)";
    imageCtx.globalCompositeOperation = 'destination-out'
    imageCtx.beginPath();
    imageCtx.moveTo(startX, startY);
    imageCtx.lineTo(e.offsetX, e.offsetY);
    imageCtx.stroke();
    imageCtx.closePath();

    startX = e.offsetX;
    startY = e.offsetY;
}

function pointer(e) {
    pointerCtx.clearRect(0, 0, imageCvs.width, imageCvs.height)
    if (mode == "2") {
        pointerCtx.strokeStyle = "rgba(255, 255, 255, 1)";
    } else {
        pointerCtx.strokeStyle = canvasRgba;
    }

    pointerCtx.lineWidth = brushSize;
    pointerCtx.lineCap = "round";

    pointerCtx.beginPath();
    pointerCtx.moveTo(e.offsetX, e.offsetY);
    pointerCtx.lineTo(e.offsetX, e.offsetY);
    pointerCtx.stroke();
    pointerCtx.closePath();
}

function image(src) {
    var img = new Image();
    img.src = src;
    img.onload = () => {
        var scale =
            Math.min(
                $('#canvas-area').width() / img.naturalWidth,
                $('#canvas-area').height() / img.naturalHeight);

        imageCvs.width = img.width * scale;
        imageCvs.height = img.height * scale;

        drawTempCvs.width = imageCvs.width;
        drawTempCvs.height = imageCvs.height;

        pointerCvs.width = imageCvs.width;
        pointerCvs.height = imageCvs.height;

        imageCtx.drawImage(img, 0, 0, imageCvs.width, imageCvs.height);
    };
}

function zoom() {
    $("#imageCanvas").css({
        "transform-origin":
            document.getElementById("dispX").innerHTML + "px " +
            document.getElementById("dispY").innerHTML + "px"
    });
    $("#drawTempCanvas").css({
        "transform-origin":
            document.getElementById("dispX").innerHTML + "px " +
            document.getElementById("dispY").innerHTML + "px"
    });
    $("#pointerCanvas").css({
        "transform-origin":
            document.getElementById("dispX").innerHTML + "px " +
            document.getElementById("dispY").innerHTML + "px"
    });

    $("#imageCanvas").css({ "transform": "scale(" + zoomRario + ")" });
    $("#drawTempCanvas").css({ "transform": "scale(" + zoomRario + ")" });
    $("#pointerCanvas").css({ "transform": "scale(" + zoomRario + ")" });
}

function imageMove(e) {
    var targetWidth = $("#imageCanvas").width();
    var targetHeight = $("#imageCanvas").height();

    var origin = $("#imageCanvas").css('transform-origin');
    var origins = origin.replaceAll("px", "").split(" ");

    var moveX = Number(origins[0]) + (startX - e.offsetX);
    var moveY = Number(origins[1]) + (startY - e.offsetY);

    if (moveX < 0) {
        moveX = 0;
    } else if (moveX > targetWidth) {
        moveX = targetWidth;
    }
    if (moveY < 0) {
        moveY = 0;
    } else if (moveY > targetHeight) {
        moveY = targetHeight;
    }

    $("#imageCanvas").css({ "transform-origin": moveX + "px " + moveY + "px" });
    $("#drawTempCanvas").css({ "transform-origin": moveX + "px " + moveY + "px" });
    $("#pointerCanvas").css({ "transform-origin": moveX + "px " + moveY + "px" });
}
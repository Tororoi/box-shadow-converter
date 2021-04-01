
let scaleInput = document.querySelector("#scale");
let uploadBtn = document.querySelector("#file-upload");
let outputResult = document.querySelector("#output");
let copyBtn = document.querySelector("#copy");
let filename = document.querySelector("#filename");

scaleInput.addEventListener("change", changeScale);
scaleInput.addEventListener("keyup", changeScale);
uploadBtn.addEventListener("change", convertImage);
copyBtn.addEventListener("click", copyToClipboard);

let canvas = document.createElement('canvas');
let ctx = canvas.getContext('2d');

let scale = 1;
let data;

function changeScale() {
  scale = this.value;
  if (data) {
    let result = convertData();

    outputResult.value = "width: " + scale + "px;\nheight: " + scale + "px;\nbox-shadow: " + result + ";";
    renderPreview(result);
  } else {
    outputResult.value = "width: " + scale + "px;\nheight: " + scale + "px;\nbox-shadow: ;";
  }
}

function convertImage() {

  let reader;
  let img = new Image;

  if (this.files && this.files[0]) {
    reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
      img.onload = () => {
        //limit size of images
        let long = img.width > img.height ? img.width : img.height;
        if (long > 256) {
          let ratio = 256 / long;
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }
        console.log(canvas)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        data = ctx.getImageData(0, 0, canvas.width, canvas.height)

        let result = convertData();

        filename.textContent = this.files[0].name;
        outputResult.value = "width: " + scale + "px;\nheight: " + scale + "px;\nbox-shadow: " + result + ";";
        renderPreview(result);
      }
    }

    reader.readAsDataURL(this.files[0]);
  }
  // 1) Create a canvas, either on the page or simply in code
}

//FIX: improve speed by storing drawn pixels in map instead of the whole image data, since transparent pixels are wasting time
function convertData() {
  let boxes = [];
  for (let y = 0; y < data.height; y++) {
    for (let x = 0; x < data.width; x++) {
      let colorObj = getColor(x, y, data.width, data);
      //Don't create box-shadow for transparent pixels
      if (colorObj.a > 0) {
        boxes.push(`${x * scale}px ${y * scale}px ${colorObj.color}`);
      }
    }
  }
  return boxes.join(', ');
}

function getColor(x, y, width, colorLayer) {
  let canvasColor = {};

  let startPos = (y * width + x) * 4;
  //clicked color
  canvasColor.r = colorLayer.data[startPos];
  canvasColor.g = colorLayer.data[startPos + 1];
  canvasColor.b = colorLayer.data[startPos + 2];
  canvasColor.a = colorLayer.data[startPos + 3];
  canvasColor.color = `rgba(${canvasColor.r},${canvasColor.g},${canvasColor.b},${canvasColor.a})`
  return canvasColor;
}

function renderPreview(shadow) {
  let preview = document.getElementById("preview");
  preview.style.width = `${scale}px`;
  preview.style.height = `${scale}px`;
  preview.style.boxShadow = shadow;
}

function copyToClipboard() {
  outputResult.select();
  outputResult.setSelectionRange(0, 99999); /* For mobile devices */

  document.execCommand("copy");
}
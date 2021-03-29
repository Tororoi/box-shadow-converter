
let scaleInput = document.querySelector("#scale");
let uploadBtn = document.querySelector("#file-upload");
let outputResult = document.querySelector("#output");

scaleInput.addEventListener("change", changeScale);
uploadBtn.addEventListener("change", convertImage);

let canvas = document.createElement('canvas');
let ctx = canvas.getContext('2d');

let result;
let scale = 1;

function changeScale() {
  scale = this.value;
}

function convertImage() {

  let reader;
  let img = new Image;

  if (this.files && this.files[0]) {
    reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
      img.onload = () => {

        ctx.drawImage(img, 0, 0, img.width, img.height)
        let data = ctx.getImageData(0, 0, img.width, img.height)

        let boxes = [];
        for (let y = 0; y < img.height; y++) {
          for (let x = 0; x < img.width; x++) {
            let colorObj = getColor(x, y, img.width, data);
            //Don't create box-shadow for transparent pixels
            if (colorObj.a > 0) {
              boxes.push(`${x * scale}px ${y * scale}px ${colorObj.color}`);
            }
          }
        }
        result = "box-shadow:" + boxes.join(', ') + ";";
        outputResult.textContent = result;
      }
    }

    reader.readAsDataURL(this.files[0]);
  }
  // 1) Create a canvas, either on the page or simply in code
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
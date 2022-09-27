const canvas = document.querySelector('canvas');
const video = document.querySelector('video');
const productName = document.querySelector('.product-name');
const addExpenseDiv = document.querySelector('.add-expense');
const addExpenseBtn = document.querySelector('button');
const priceInput = document.querySelector('#price');

const serverURL = 'http://localhost:3000';

let nameLabel;
let nameInput;
let code;

addExpenseBtn.addEventListener('click', async (_) => {
  try {
    if (nameInput) {
      await axios.post(`${serverURL + '/addProduct'}`, {
        name: nameInput.value,
        code,
      });
    }

    await axios.post(`${serverURL + '/addExpense'}`, {
      code,
      price: priceInput.value,
    });

    if (nameInput) {
      addExpenseDiv.removeChild(nameLabel);
      addExpenseDiv.removeChild(nameInput);
    }

    productName.innerHTML = '';
    priceInput.value = '';
    addExpenseDiv.style.display = 'none';
    nameInput = undefined;
    nameLabel = undefined;
  } catch (error) {
    console.log(error);
  }
});

navigator.mediaDevices
  .getUserMedia({
    video: {
      height: 400,
      width: 640,
    },
  })
  .then((stream) => {
    video.srcObject = stream;
    video.play();
    const detector = new BarcodeDetector({
      formats: [
        'aztec',
        'code_128',
        'code_39',
        'code_93',
        'codabar',
        'data_matrix',
        'ean_13',
        'ean_8',
        'itf',
        'pdf417',
        'qr_code',
        'upc_a',
        'upc_e',
      ],
    });

    const ctx = canvas.getContext('2d');
    setInterval(() => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      detector
        .detect(canvas)
        .then(async (barcode) => {
          if (barcode.length > 0) {
            addExpenseDiv.style.display = 'block';
            code = barcode[0].rawValue;
            const response = await axios.post(
              `${serverURL + '/checkProduct'}`,
              {
                code: barcode[0].rawValue,
              }
            );

            if (!response.data.isSaved) {
              productName.innerHTML = '<b>unknown product</b>';

              if (addExpenseDiv.querySelector('.name-label')) {
                return;
              }

              nameLabel = document.createElement('label');
              nameLabel.setAttribute('class', 'name-label');
              nameLabel.textContent = 'name of the product';
              nameInput = document.createElement('input');
              nameInput.style.display = 'block';
              nameInput.placeholder = 'nutella';
              nameInput.type = 'text';

              addExpenseDiv.prepend(nameInput);
              addExpenseDiv.prepend(nameLabel);
            } else {
              productName.innerHTML = `product name: <b>${response.data.name}</b>`;
              if (addExpenseDiv.querySelector('.name-label')) {
                addExpenseDiv.removeChild(nameLabel);
                addExpenseDiv.removeChild(nameInput);
              }
            }
          }
        })
        .catch((err) => console.log(err));
    }, 50);
  })
  .catch((err) => console.log(err));

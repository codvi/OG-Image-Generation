const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// Function to wrap text
const wrapText = (context, text, maxWidth) => {
  const words = text.split(' ');
  let line = '';
  const lines = [];

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = context.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      lines.push(line);
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);
  return lines;
};

app.post('/generate-og-image', upload.single('image'), async (req, res) => {
  const { title, content, posterName } = req.body;
  const imageFile = req.file;

  const canvas = createCanvas(1250, 680);  // Increased the canvas size
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#ff7e5f');
  gradient.addColorStop(1, '#feb47b');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Rounded corners
  const borderRadius = 30;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(borderRadius, 0);
  ctx.lineTo(canvas.width - borderRadius, 0);
  ctx.quadraticCurveTo(canvas.width, 0, canvas.width, borderRadius);
  ctx.lineTo(canvas.width, canvas.height - borderRadius);
  ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - borderRadius, canvas.height);
  ctx.lineTo(borderRadius, canvas.height);
  ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - borderRadius);
  ctx.lineTo(0, borderRadius);
  ctx.quadraticCurveTo(0, 0, borderRadius, 0);
  ctx.closePath();
  ctx.clip();

  const titleFont = 'bold 40px Arial';
  const contentFont = '24px Arial';
  const posterFont = 'italic 24px Arial';
  const textColor = '#333';
  const lineHeight = 40;  // Adjusted line height for better readability

  ctx.fillStyle = textColor;

  // Poster Name
  ctx.font = posterFont;
  ctx.textAlign = 'left';
  ctx.fillText(posterName, 50, 50);

  // Title
  ctx.font = titleFont;
  const titleMaxWidth = 1000;  // Adjust the max width for title
  const titleLines = wrapText(ctx, title, titleMaxWidth);
  let y = 130;  // Starting y position for title, adjusted to leave space for icon
  titleLines.forEach(line => {
    ctx.fillText(line, 50, y);
    y += lineHeight;
  });

  const maxWidth = 1000;
  const maxLines = 5;
  const words = content.split(' ');
  let line = '';
  y += 20;  // Add some space after title
  const maxHeight = y + (maxLines * lineHeight);

  ctx.font = contentFont;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, 50, y);
      line = words[n] + ' ';
      y += lineHeight;

      if (y > maxHeight) {
        for (let i = y; i <= maxHeight + 50; i += lineHeight) {
          const fadeOpacity = Math.max(0, 0.8 - (i - maxHeight) / 50);
          ctx.fillStyle = `rgba(51, 51, 51, ${fadeOpacity})`;
          ctx.fillText(line, 50, i);
          line += words[n] + ' ';
        }
        break;
      }
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 50, y);

  if (imageFile) {
    try {
      const image = await loadImage(path.join(__dirname, 'uploads', imageFile.filename));
      const aspectRatio = image.width / image.height;
      const width = Math.min(400, image.width);  // Increased the image size
      const height = width / aspectRatio;
      const x = (canvas.width - width) / 2;
      const y = 350; 
      ctx.drawImage(image, x, y, width, height);
      ctx.lineWidth = 10;
      ctx.strokeStyle = '#333';
      ctx.strokeRect(x, y, width, height);
    } catch (error) {
      console.error('Error loading uploaded image:', error);
    }
  }

  const iconPath = path.join(__dirname, 'branding', 'reddit-icon.png'); 
  try {
    const icon = await loadImage(iconPath);
    ctx.drawImage(icon, 1150, 20, 60, 60); // Adjusted position to leave more space for the title
  } catch (error) {
    console.error('Error loading Reddit icon image:', error);
  }

  ctx.restore();

  res.set('Content-Type', 'image/png');
  canvas.createPNGStream().pipe(res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

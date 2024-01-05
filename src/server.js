// server.js
const express = require('express');
const cors = require('cors');
const formidable = require('formidable');
const OpenAI = require('openai');

const app = express();
const port = 3001; // Use a different port if 3001 is in use

app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: 'YOUR_OPENAI_API_KEY' });

app.post('/transcribe', async (req, res) => {
  try {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: 'Error parsing form data' });
      }

      const audioFile = files.audio;

      // Use OpenAI API to transcribe audio
      const response = await openai.audio.transcribe({
        audio: audioFile.path,
        model: 'whisper-1',
      });

      const transcription = response.data.text;
      res.json({ transcription });
    });
  } catch (error) {
    console.error('Error transcribing audio:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

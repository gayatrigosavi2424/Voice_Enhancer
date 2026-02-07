# Voice Enhancer Pro

A professional-grade web application for audio enhancement, designed for content creators, podcasters, and singers. Remove background noise, enhance voice quality, and create studio-quality recordings directly in your browser.

## 🎯 Features

### Core Audio Processing
- **Background Noise Removal**: Advanced noise reduction algorithms to eliminate unwanted background sounds
- **Voice Enhancement**: Professional EQ and compression to boost voice clarity and richness
- **Smart Silence Removal**: Automatically detect and remove long pauses while preserving natural speech rhythm
- **Volume Normalization**: Ensure consistent audio levels throughout your recording
- **Real-time Processing**: Fast, client-side processing with instant preview

### User Experience
- **Drag & Drop Upload**: Easy file upload with support for multiple audio formats (WAV, MP3, M4A, AAC, OGG, MP4)
- **Live Recording**: Record directly from your microphone with real-time enhancement
- **Visual Waveform**: Interactive waveform display with comparison view
- **Preset Configurations**: Quick presets for Podcast, Music, and Interview scenarios
- **Privacy First**: All processing happens locally in your browser - no data leaves your device

## 🚀 Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Audio Processing**: Web Audio API with custom enhancement algorithms
- **Styling**: Tailwind CSS with custom components
- **Visualization**: Canvas-based waveform rendering
- **Deployment**: Optimized for Vercel

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd voice-enhancer-pro
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔧 Usage

### Quick Start
1. **Upload Audio**: Drag and drop an audio file or click to browse
2. **Or Record Live**: Use the microphone to record directly
3. **Automatic Enhancement**: The app applies default settings automatically
4. **Customize Settings**: Adjust noise reduction, voice enhancement, and other parameters
5. **Preview & Download**: Listen to the enhanced audio and download when satisfied

### Advanced Settings

#### Noise Reduction (0-100%)
- Controls the intensity of background noise removal
- Higher values remove more noise but may affect audio quality
- Recommended: 70-80% for most recordings

#### Voice Enhancement (0-100%)
- Boosts voice frequencies and applies gentle compression
- Improves clarity and presence of speech
- Recommended: 60-70% for voice recordings

#### Smart Silence Removal
- Automatically removes long pauses (>0.5 seconds)
- Preserves natural speech rhythm
- Adjustable silence threshold (1-10%)

#### Volume Normalization
- Ensures consistent volume levels
- Target volume: 50-100% of maximum
- Recommended: 80% for most content

### Presets
- **Podcast**: Optimized for spoken content with high noise reduction
- **Music**: Balanced settings preserving musical dynamics
- **Interview**: Maximum clarity for multi-speaker recordings

## 🎨 Browser Compatibility

- Chrome 66+ (recommended)
- Firefox 60+
- Safari 14.1+
- Edge 79+

**Note**: Requires modern browser with Web Audio API support

## 📱 Mobile Support

The application is responsive and works on mobile devices, though desktop is recommended for the best experience with larger audio files.

## 🔒 Privacy & Security

- **100% Client-Side Processing**: All audio processing happens in your browser
- **No Data Upload**: Your audio files never leave your device
- **No Registration Required**: Use immediately without creating accounts
- **HTTPS Required**: Secure connection for microphone access

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with default settings

The application is optimized for Vercel's serverless environment with:
- Static file optimization
- Automatic HTTPS
- Global CDN distribution
- Zero configuration deployment

### Other Platforms

The app can be deployed to any static hosting service:
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Firebase Hosting

## 🛠️ Development

### Project Structure
```
├── app/
│   ├── components/          # React components
│   │   ├── AudioUploader.tsx
│   │   ├── AudioProcessor.tsx
│   │   ├── WaveformVisualizer.tsx
│   │   ├── AudioControls.tsx
│   │   └── ProcessingStatus.tsx
│   ├── utils/
│   │   └── audioEnhancer.ts # Core audio processing engine
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main page
├── public/                  # Static assets
└── package.json
```

### Key Components

- **AudioEnhancer**: Core audio processing engine with noise reduction, EQ, and compression
- **WaveformVisualizer**: Canvas-based audio visualization with comparison view
- **AudioControls**: Settings panel with presets and real-time parameter adjustment
- **AudioUploader**: File upload and microphone recording interface

## 🎵 Audio Processing Details

### Noise Reduction Algorithm
- Spectral subtraction approach
- Adaptive noise profile estimation
- Smoothing filters to reduce artifacts

### Voice Enhancement
- High-pass filtering for rumble removal
- Mid-frequency boost (300Hz-3kHz)
- Gentle compression for dynamic control

### Silence Detection
- Amplitude-based silence detection
- Configurable threshold and minimum duration
- Natural pause preservation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Web Audio API documentation and community
- Audio processing research and algorithms
- Open source audio libraries and tools

## 📞 Support

For support, feature requests, or bug reports, please open an issue on GitHub.

---

**Voice Enhancer Pro** - Professional audio enhancement for everyone 🎙️✨
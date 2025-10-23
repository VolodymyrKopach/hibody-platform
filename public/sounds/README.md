# Sound Files Directory

⚠️ **No Audio Files Required!**

This application uses **Web Audio API** to generate all sounds programmatically in JavaScript. No external audio files are needed!

## How It Works

The `SoundService` (`src/services/interactive/SoundService.ts`) uses the Web Audio API to:
- Generate tones with oscillators
- Create synthesized sound effects
- Produce melodies and chords
- Simulate animal sounds

## Available Sound Effects

All sounds are generated in real-time:

### Game Sounds (Synthesized)
- `success` - Happy major chord (C, E, G)
- `wrong` - Dissonant tone
- `celebration` - Ascending melody (C5 → D5 → E5 → G5 → C6)
- `tap` - Short click sound
- `drop` - Falling pitch effect

### Animal Sounds (Approximated)
- `animal-cat` - High-pitched meow simulation
- `animal-dog` - Low bark approximation  
- `animal-cow` - Deep moo sound
- `animal-bird` - Quick chirp sequence

### Praise Sounds (Musical Arpeggios)
- `praise-great` - C major arpeggio
- `praise-wonderful` - D major arpeggio
- `praise-youdid it` - E major arpeggio

## Benefits

✅ **Zero external dependencies** - No files to download or manage
✅ **Instant loading** - Sounds generate instantly, no network delay
✅ **Small bundle size** - No audio files in your build
✅ **Always available** - Works offline without assets
✅ **Customizable** - Easy to adjust frequencies and patterns
✅ **Cross-browser** - Web Audio API supported in all modern browsers

## Technical Details

The service uses:
- **OscillatorNode** for tone generation
- **GainNode** for volume control and ADSR envelopes
- **Multiple oscillator types**: sine, triangle, sawtooth, square
- **Frequency modulation** for dynamic effects
- **Timed sequences** for melodies

## Customization

To modify sounds, edit the private methods in `SoundService.ts`:
- `playSuccessSound()` - Change chord notes
- `playAnimalSound()` - Adjust frequency patterns
- `playCelebrationSound()` - Modify melody sequence
- etc.

No external audio editing tools required!


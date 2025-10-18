# Sound Files Directory

This directory contains audio files used by interactive components.

## Required Files

The following sound files are used by the interactive components:

### Game Sounds
- `success.mp3` - Played when user gets correct answer
- `wrong.mp3` - Played when user gets incorrect answer
- `celebration.mp3` - Played when completing a game/activity
- `tap.mp3` - Played on tap interactions

### Voice Sounds
- `praise-1.mp3` through `praise-5.mp3` - Random praise sounds

### Animal Sounds (for TapImage and SoundMatcher)
- `animal-cat.mp3` - Cat sound
- `animal-dog.mp3` - Dog sound
- `animal-bird.mp3` - Bird sound
- etc.

## Placeholder Mode

If sound files are missing, the SoundService will:
1. Log a warning to console
2. Gracefully fail (no error thrown)
3. Continue without sound

This allows the app to work without actual sound files during development.

## Adding Real Sounds

To add real sound files:

1. Place `.mp3` files in this directory
2. Ensure filenames match those referenced in `SoundService.ts`
3. Recommended: Use short clips (1-3 seconds)
4. Format: MP3, 128kbps or lower for smaller file sizes

## Free Sound Resources

- [Freesound.org](https://freesound.org/)
- [ZapSplat](https://www.zapsplat.com/)
- [Mixkit](https://mixkit.co/free-sound-effects/)
- [BBC Sound Effects](https://sound-effects.bbcrewind.co.uk/)

## License

Ensure any sound files you add have appropriate licenses for your use case.


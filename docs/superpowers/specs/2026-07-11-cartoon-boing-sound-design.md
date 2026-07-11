# Cartoon Boing Submission Sound Design

## Goal

Add lightweight, funny audio feedback after a complaint is successfully saved.

## Behavior

- Play one randomly selected Tiny Cartoon Boing variation only after successful complaint creation.
- Provide three related variations with different starting pitch, ending pitch, and bounce duration.
- Do not play audio when validation fails or persistence returns an error.
- Keep every sound short enough to avoid delaying continued use of the form.
- Ignore Web Audio availability or playback failures silently so audio can never block complaint submission.

## Implementation

Create a focused `playCartoonBoing()` utility using the browser Web Audio API. Each call selects one of three oscillator configurations and applies a fast pitch drop plus gain envelope. Lazily create or resume the audio context inside the user-triggered submit flow to satisfy browser autoplay rules.

Call the utility from `ComplaintForm` only after `onCreate(values)` returns success. No audio files, dependencies, data-model changes, or service changes are required.

## Verification

- Unit-test random variant selection using injected browser primitives.
- Verify successful submission invokes the sound utility once.
- Verify failed submission does not invoke the sound utility.
- Confirm the existing test suite and production build remain green.

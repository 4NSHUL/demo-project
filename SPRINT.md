# Product-Building Sprint Kit

## First 15 minutes

1. Name one target user and their sharpest pain point.
2. Draw the three-screen happy path.
3. Decide the one AI moment the judges can see.
4. Cut everything that is not needed for a three-minute demo.

## 90-minute build sequence

1. Ship the happy path with static data.
2. Make it visually clear before adding edge cases.
3. Use a mocked AI response if a live API is not instantly available.
4. Rehearse the demo with a teammate and fix only visible friction.

## Copyable AI prompts

- `Create a responsive React component for [screen]. Use Tailwind. Keep it in one file and use the provided data shape.`
- `Given this React error and these files, identify the smallest fix. Do not refactor unrelated code.`
- `Write three concise value propositions for [target user] who struggles with [pain point].`
- `Generate realistic demo JSON for [product], with five records and no personally identifiable information.`

## Git essentials

```bash
git status
git add .
git commit -m "feat: add [small visible feature]"
git push
```

## Three-minute demo

1. `This is for [user] who struggles with [pain].`
2. Show the full happy path, without explaining code.
3. Point out the AI-powered decision or generation moment.
4. Close with: `With more time, we would add [one valuable next step].`

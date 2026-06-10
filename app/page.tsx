'use client'

import { useMemo, useState } from 'react'

type FoodVerdict = 'junk' | 'healthy' | 'neutral'

type FoodRule = {
  keywords: string[]
  verdict: FoodVerdict
  emoji: string
  title: string
  message: string
  tip: string
}

const rules: FoodRule[] = [
  {
    keywords: [
      'apple',
      'banana',
      'berries',
      'blueberry',
      'broccoli',
      'carrot',
      'chicken',
      'fish',
      'lentils',
      'oats',
      'orange',
      'salad',
      'spinach',
      'yogurt',
      'овсян',
      'яблок',
      'банан',
      'брокколи',
      'морков',
      'рыба',
      'салат',
      'творог',
      'йогурт'
    ],
    verdict: 'healthy',
    emoji: '🥦',
    title: 'Looks pretty wholesome!',
    message: 'That sounds like a nourishing choice with useful nutrients for everyday meals.',
    tip: 'Keep it balanced with protein, fiber, healthy fats, and plenty of water.'
  },
  {
    keywords: [
      'burger',
      'candy',
      'chips',
      'cola',
      'cookie',
      'donut',
      'fries',
      'fried',
      'hot dog',
      'ice cream',
      'pizza',
      'soda',
      'бургер',
      'газиров',
      'картошка фри',
      'конфет',
      'морожен',
      'пицц',
      'пончик',
      'фастфуд',
      'чипс'
    ],
    verdict: 'junk',
    emoji: '🍟',
    title: 'Probably more of a treat.',
    message:
      'This food is often high in sugar, salt, saturated fat, or calories, so it fits the “junk” side more often.',
    tip: 'No shame in enjoying it sometimes — try smaller portions and pair it with something fresh.'
  },
  {
    keywords: [
      'bread',
      'cheese',
      'coffee',
      'egg',
      'pasta',
      'potato',
      'rice',
      'sandwich',
      'soup',
      'steak',
      'сыр',
      'кофе',
      'паста',
      'рис',
      'картоф',
      'суп',
      'стейк',
      'хлеб',
      'яйц'
    ],
    verdict: 'neutral',
    emoji: '🍽️',
    title: 'It depends on the details.',
    message:
      'This can be healthy, neutral, or less healthy depending on ingredients, cooking method, and portion size.',
    tip: 'Look at how it is prepared: baked or grilled usually beats deep-fried, and whole foods beat ultra-processed versions.'
  }
]

const fallbackRule: FoodRule = {
  keywords: [],
  verdict: 'neutral',
  emoji: '🤔',
  title: 'Let’s call it neutral for now.',
  message: 'I do not have a strong match for this food, so context matters most.',
  tip: 'Check the ingredient list, portion size, and how often you eat it. One food rarely defines your whole diet.'
}

const examples = ['Apple', 'Pizza', 'Rice', 'Овсянка', 'Чипсы']

const resultStyles: Record<FoodVerdict, string> = {
  healthy: 'border-emerald-300/70 bg-emerald-50/80',
  junk: 'border-rose-300/70 bg-rose-50/80',
  neutral: 'border-amber-300/70 bg-amber-50/80'
}

export default function Home() {
  const [foodName, setFoodName] = useState('')

  const result = useMemo(() => {
    const normalizedFoodName = foodName.trim().toLowerCase()

    if (!normalizedFoodName) {
      return null
    }

    return (
      rules.find((rule) =>
        rule.keywords.some((keyword) => normalizedFoodName.includes(keyword))
      ) ?? fallbackRule
    )
  }, [foodName])

  return (
    <main className="grid min-h-screen place-items-center px-4 py-8 text-[#243018] sm:px-8">
      <section
        aria-labelledby="app-title"
        className="w-full max-w-3xl rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_1.5rem_5rem_rgba(116,65,20,0.16)] backdrop-blur-xl sm:p-10 lg:p-12"
      >
        <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-orange-600">
          Friendly nutrition vibes
        </p>
        <h1 id="app-title" className="text-6xl font-black leading-[0.88] tracking-[-0.08em] sm:text-8xl">
          Junk or No
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#66704f]">
          Type any food and get a gentle, practical answer: is it usually junk, healthy, or
          somewhere in the middle?
        </p>

        <form className="mt-8" onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="food-input" className="mb-3 block font-extrabold">
            What food are you curious about?
          </label>
          <div className="grid gap-3 sm:flex">
            <input
              id="food-input"
              name="food"
              type="text"
              autoComplete="off"
              value={foodName}
              onChange={(event) => setFoodName(event.target.value)}
              placeholder="e.g. pizza, apple, rice..."
              className="min-h-14 w-full rounded-2xl border-2 border-transparent bg-white px-5 text-base shadow-[inset_0_0_0_1px_rgba(36,48,24,0.1)] outline-none transition focus:border-orange-400 focus:shadow-[0_0_0_0.28rem_rgba(255,122,69,0.32)]"
            />
            <button
              type="button"
              onClick={() => setFoodName('')}
              className="rounded-full bg-[#243018] px-5 py-3 font-extrabold text-white transition hover:-translate-y-0.5 hover:opacity-90"
            >
              Clear
            </button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-[#66704f]" aria-label="Try an example">
          <span>Try:</span>
          {examples.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setFoodName(example)}
              className="rounded-full bg-white px-3 py-2 font-extrabold text-[#243018] shadow-[inset_0_0_0_1px_rgba(36,48,24,0.1)] transition hover:-translate-y-0.5 hover:opacity-90"
            >
              {example}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {result ? (
            <article
              className={`grid min-h-40 gap-4 rounded-3xl border-2 p-5 sm:grid-cols-[auto_1fr] ${resultStyles[result.verdict]}`}
            >
              <div
                className="grid size-16 place-items-center rounded-2xl bg-orange-100 text-3xl"
                aria-hidden="true"
              >
                {result.emoji}
              </div>
              <div>
                <p className="mb-1 text-xs font-black uppercase tracking-[0.16em] text-orange-600">
                  {result.verdict}
                </p>
                <h2 className="mb-2 text-2xl font-black sm:text-3xl">{result.title}</h2>
                <p className="leading-7 text-[#66704f]">{result.message}</p>
                <p className="mt-4 leading-7 text-[#66704f]">
                  <strong>Friendly tip:</strong> {result.tip}
                </p>
              </div>
            </article>
          ) : (
            <article className="grid min-h-40 items-center gap-4 rounded-3xl border-2 border-dashed border-[#243018]/15 bg-white/50 p-5 sm:grid-cols-[auto_1fr]">
              <div className="grid size-16 place-items-center rounded-2xl bg-orange-100 text-3xl" aria-hidden="true">
                ✨
              </div>
              <p className="leading-7 text-[#66704f]">Start typing to get a friendly food verdict.</p>
            </article>
          )}
        </div>
      </section>
    </main>
  )
}

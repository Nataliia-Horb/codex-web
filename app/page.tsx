'use client'

import { useMemo, useState } from 'react'
import {
  foodReference,
  ingredientSignals,
  preparationSignals,
  type FoodVerdict,
  type ReferenceFood,
  type Signal
} from './foodReference'

type AnalysisResult = {
  verdict: FoodVerdict
  score: number
  title: string
  badge: string
  emoji: string
  summary: string
  matchedFoods: ReferenceFood[]
  matchedSignals: Signal[]
  suggestions: string[]
}

const examples = [
  {
    name: 'Курица с овощами',
    description: 'Куриная грудка запечена в духовке, много овощей, немного оливкового масла.'
  },
  {
    name: 'Пицца с колбасой',
    description: 'Белое тесто, много сыра, колбаса, майонезный соус, большая порция.'
  },
  {
    name: 'Овсянка',
    description: 'Овсяные хлопья на молоке без сахара, сверху яблоко и орехи.'
  }
]

const verdictStyles: Record<FoodVerdict, string> = {
  healthy: 'border-emerald-300/70 bg-emerald-50/90 text-emerald-950',
  harmful: 'border-rose-300/70 bg-rose-50/90 text-rose-950',
  neutral: 'border-amber-300/70 bg-amber-50/90 text-amber-950'
}

const verdictLabels: Record<FoodVerdict, string> = {
  healthy: 'скорее не вредная',
  harmful: 'скорее вредная',
  neutral: 'зависит от деталей'
}

const normalize = (value: string) => value.trim().toLowerCase().replace(/ё/g, 'е')

const findMatches = <T extends { keywords: string[] }>(items: T[], text: string) =>
  items.filter((item) => item.keywords.some((keyword) => text.includes(normalize(keyword))))

const clampScore = (score: number) => Math.max(-6, Math.min(6, score))

const getVerdict = (score: number): FoodVerdict => {
  if (score >= 3) {
    return 'healthy'
  }

  if (score <= -3) {
    return 'harmful'
  }

  return 'neutral'
}

const getResultCopy = (verdict: FoodVerdict) => {
  if (verdict === 'healthy') {
    return {
      title: 'Похоже, это хороший вариант',
      badge: 'Можно часто, если порция адекватная',
      emoji: '🥦',
      summary:
        'По справочнику и описанию блюдо выглядит питательным: есть цельные продукты, белок, клетчатка или щадящий способ приготовления.'
    }
  }

  if (verdict === 'harmful') {
    return {
      title: 'Скорее вредная еда или лакомство',
      badge: 'Лучше реже и меньшей порцией',
      emoji: '🍟',
      summary:
        'В описании есть признаки, которые часто делают еду менее полезной: фритюр, много сахара/соли, переработанное мясо, жирные соусы или большая порция.'
    }
  }

  return {
    title: 'Однозначного ответа нет',
    badge: 'Смотрите на состав и частоту',
    emoji: '🍽️',
    summary:
      'Такая еда может быть нормальной или не очень — решают способ приготовления, добавки, порция и то, как часто вы ее едите.'
  }
}

const analyzeFood = (foodName: string, description: string): AnalysisResult | null => {
  const query = normalize(`${foodName} ${description}`)

  if (!query) {
    return null
  }

  const matchedFoods = findMatches(foodReference, query)
  const matchedPreparation = findMatches(preparationSignals, query)
  const matchedIngredients = findMatches(ingredientSignals, query)
  const matchedSignals = [...matchedPreparation, ...matchedIngredients]

  const foodScore = matchedFoods.length
    ? matchedFoods.reduce((total, food) => total + food.score, 0) / matchedFoods.length
    : 0
  const signalScore = matchedSignals.reduce((total, signal) => total + signal.score, 0)
  const score = clampScore(Math.round(foodScore + signalScore))
  const verdict = getVerdict(score)
  const copy = getResultCopy(verdict)

  const suggestions = [
    ...matchedFoods.slice(0, 3).map((food) => food.suggestion),
    verdict === 'harmful'
      ? 'Чтобы улучшить блюдо: уменьшите сахар/соль/соус, замените фритюр запеканием и добавьте овощи.'
      : 'Для точнее оценки укажите: жарили или запекали, сколько сахара/соли/соуса и примерный размер порции.'
  ]

  return {
    verdict,
    score,
    ...copy,
    matchedFoods,
    matchedSignals,
    suggestions: Array.from(new Set(suggestions)).slice(0, 4)
  }
}

export default function Home() {
  const [foodName, setFoodName] = useState('')
  const [description, setDescription] = useState('')

  const result = useMemo(() => analyzeFood(foodName, description), [foodName, description])

  const fillExample = (example: (typeof examples)[number]) => {
    setFoodName(example.name)
    setDescription(example.description)
  }

  const clearForm = () => {
    setFoodName('')
    setDescription('')
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-8 text-[#243018] sm:px-8">
      <section
        aria-labelledby="app-title"
        className="w-full max-w-5xl rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_1.5rem_5rem_rgba(116,65,20,0.16)] backdrop-blur-xl sm:p-10 lg:p-12"
      >
        <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-orange-600">
          Большой справочник продуктов + способ приготовления
        </p>
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <h1 id="app-title" className="text-5xl font-black leading-[0.9] tracking-[-0.07em] sm:text-7xl">
              Вредная еда или нет?
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#66704f]">
              Введите название еды и коротко опишите, как она сделана. Приложение сравнит текст с
              большим локальным справочником продуктов, найдет признаки приготовления и покажет
              мягкую оценку.
            </p>
          </div>
          <aside className="rounded-3xl bg-orange-50 p-5 text-sm leading-6 text-[#66704f] shadow-[inset_0_0_0_1px_rgba(255,122,69,0.18)]">
            <strong className="block text-[#243018]">Важно:</strong> Это бытовая подсказка, а не
            медицинская рекомендация. Если есть заболевания, аллергии или специальная диета, лучше
            сверяться с врачом или нутрициологом.
          </aside>
        </div>

        <form className="mt-8 grid gap-5" onSubmit={(event) => event.preventDefault()}>
          <div>
            <label htmlFor="food-input" className="mb-3 block font-extrabold">
              Название еды
            </label>
            <input
              id="food-input"
              name="food"
              type="text"
              autoComplete="off"
              value={foodName}
              onChange={(event) => setFoodName(event.target.value)}
              placeholder="Например: пицца, овсянка, курица с овощами..."
              className="min-h-14 w-full rounded-2xl border-2 border-transparent bg-white px-5 text-base shadow-[inset_0_0_0_1px_rgba(36,48,24,0.1)] outline-none transition focus:border-orange-400 focus:shadow-[0_0_0_0.28rem_rgba(255,122,69,0.32)]"
            />
          </div>

          <div>
            <label htmlFor="food-description" className="mb-3 block font-extrabold">
              Короткое описание: состав, способ приготовления, порция
            </label>
            <textarea
              id="food-description"
              name="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Например: жареная во фритюре, много соли и майонеза; или запечено, без сахара, много овощей..."
              className="min-h-32 w-full resize-y rounded-2xl border-2 border-transparent bg-white px-5 py-4 text-base leading-7 shadow-[inset_0_0_0_1px_rgba(36,48,24,0.1)] outline-none transition focus:border-orange-400 focus:shadow-[0_0_0_0.28rem_rgba(255,122,69,0.32)]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={clearForm}
              className="rounded-full bg-[#243018] px-5 py-3 font-extrabold text-white transition hover:-translate-y-0.5 hover:opacity-90"
            >
              Очистить
            </button>
            <span className="text-sm text-[#66704f]">
              Справочник: {foodReference.length} групп продуктов и {preparationSignals.length + ingredientSignals.length}{' '}
              признаков состава/готовки.
            </span>
          </div>
        </form>

        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-[#66704f]" aria-label="Попробовать пример">
          <span>Примеры:</span>
          {examples.map((example) => (
            <button
              key={example.name}
              type="button"
              onClick={() => fillExample(example)}
              className="rounded-full bg-white px-3 py-2 font-extrabold text-[#243018] shadow-[inset_0_0_0_1px_rgba(36,48,24,0.1)] transition hover:-translate-y-0.5 hover:opacity-90"
            >
              {example.name}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {result ? (
            <article className={`grid gap-5 rounded-3xl border-2 p-5 sm:grid-cols-[auto_1fr] ${verdictStyles[result.verdict]}`}>
              <div className="grid size-16 place-items-center rounded-2xl bg-white/75 text-3xl" aria-hidden="true">
                {result.emoji}
              </div>
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <p className="rounded-full bg-white/75 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-orange-700">
                    {verdictLabels[result.verdict]}
                  </p>
                  <p className="rounded-full bg-white/75 px-3 py-1 text-xs font-black uppercase tracking-[0.14em]">
                    оценка {result.score > 0 ? '+' : ''}{result.score}
                  </p>
                </div>
                <h2 className="mb-2 text-2xl font-black sm:text-3xl">{result.title}</h2>
                <p className="leading-7 text-[#66704f]">{result.summary}</p>
                <p className="mt-3 font-extrabold">{result.badge}</p>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <section className="rounded-2xl bg-white/65 p-4">
                    <h3 className="font-black">Что найдено в справочнике</h3>
                    {result.matchedFoods.length ? (
                      <ul className="mt-3 space-y-2 text-sm leading-6 text-[#66704f]">
                        {result.matchedFoods.slice(0, 4).map((food) => (
                          <li key={food.group}>
                            <strong className="text-[#243018]">{food.group}:</strong> {food.reason}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm leading-6 text-[#66704f]">
                        Продукт не найден точно. Попробуйте добавить более обычное название или ингредиенты.
                      </p>
                    )}
                  </section>

                  <section className="rounded-2xl bg-white/65 p-4">
                    <h3 className="font-black">Признаки из описания</h3>
                    {result.matchedSignals.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {result.matchedSignals.map((signal) => (
                          <span key={signal.label} className="rounded-full bg-white px-3 py-2 text-sm font-bold text-[#66704f]">
                            {signal.label} ({signal.score > 0 ? '+' : ''}{signal.score})
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm leading-6 text-[#66704f]">
                        Пока мало деталей о приготовлении. Укажите: жареное/запеченное, сахар, соль, соусы и порцию.
                      </p>
                    )}
                  </section>
                </div>

                <section className="mt-5 rounded-2xl bg-white/65 p-4">
                  <h3 className="font-black">Как сделать лучше</h3>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[#66704f]">
                    {result.suggestions.map((suggestion) => (
                      <li key={suggestion}>{suggestion}</li>
                    ))}
                  </ul>
                </section>
              </div>
            </article>
          ) : (
            <article className="grid min-h-40 items-center gap-4 rounded-3xl border-2 border-dashed border-[#243018]/15 bg-white/50 p-5 sm:grid-cols-[auto_1fr]">
              <div className="grid size-16 place-items-center rounded-2xl bg-orange-100 text-3xl" aria-hidden="true">
                ✨
              </div>
              <p className="leading-7 text-[#66704f]">
                Начните вводить еду и описание — результат появится автоматически.
              </p>
            </article>
          )}
        </div>
      </section>
    </main>
  )
}

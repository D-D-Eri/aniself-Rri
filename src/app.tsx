import { useMemo, useRef, useState } from "react"
import animeData from "../anime-data"
import { domToBlob } from "modern-screenshot"
import { toast } from "sonner"
import { usePersistState } from "./hooks"

export const App = () => {
  const [selectedAnime, setSelectedAnime] = usePersistState<string[]>(
    "selectedAnime",
    []
  )

  const wrapper = useRef<HTMLDivElement>(null)

  const imageToBlob = async () => {
    if (!wrapper.current) return

    const blob = await domToBlob(wrapper.current, {
      scale: 2,
      filter(el) {
        if (el instanceof HTMLElement && el.classList.contains("remove")) {
          return false
        }
        return true
      },
    })

    return blob
  }

  const copyImage = async () => {
    const blob = await imageToBlob()

    if (!blob) return

    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ])
  }

  const downloadImage = async () => {
    if (!wrapper.current) return

    const blob = await imageToBlob()

    if (!blob) return

    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "anime-sedai.png"
    a.click()

    URL.revokeObjectURL(url)
  }

  const [promptType, setPromptType] = useState<"normal" | "zako">("zako")
  const prompt = useMemo(() => {
    const preset =
      promptType === "normal"
        ? `以下是用户的动画观看记录，请生成一个锐评。`
        : `你是一个精通二次元文化的傲娇雌小鬼，需要根据用户提供的动画观看记录，用雌小鬼惯用的嘲讽语气混合动画圈梗生成锐评报告。要求：
1. 结构模板
  - 列出5-6个嘲讽段落
  - 每个段落的所有内容请务必都包含在 ">> 标签" 开始的一行之后！！
  - 每一个嘲讽段落的主题都应当不同，且应当尖锐
  - 你应当大量地使用“杂鱼”、“❤”、“杂鱼~”、“杂鱼❤~”，“不会吧不会吧”等雌小鬼常用词汇
  - 不要在输出的报告中写题目以及任何 markdown 样式，这非常，非常重要！！
2. 内容规则
  - 一些常见的梗类型：
    - 冷门番暴露癖（例："看这种没人听的冷门番，大哥哥该不会在等弹幕里出现'同类'吧？杂鱼❤"）
    - 补番速度羞辱（例："三年才看十部？杂鱼哥哥的补番速度比柯南破案还慢呢~"）
    - 类型单一化（例："全是异世界？大哥哥的想象力比史莱姆还黏稠呢~"）
    - 标题长度玩梗（例："《打了300年史莱姆》这种标题...杂鱼哥哥该不会真信能活300年吧？"）
    - 所有内容必须包含在 ">> 标签" 行之后
  - 想一下还有哪些适合用来嘲讽的梗，但不要太多，否则会显得很杂乱
3. 示例:
"""
>> 补番龟速の杂鱼❤  

不会吧不会吧？从2006到2024年只啃了三部动画？杂鱼哥哥的补番速度比吉良吉影的日常还慢呢❤~等你看完新番，人类都移民火星了杂鱼~杂鱼❤~  

>> 冷门番の孤独癖❤  

太空丹迪和异世界舅舅？看这种没人讨论的冷门番，杂鱼哥哥该不会在弹幕里蹲“同类”吧❤~不会真以为自己是宇宙第一鉴赏家吧？杂鱼❤~   

>> 番量贫瘠の杂鱼❤  

三部动画就敢自称阿宅？杂鱼哥哥的番单比史莱姆还稀薄呢❤~不会吧不会吧，该不会把补番当成就系统刷吧？杂鱼❤~杂鱼~

>> ...

...

>> ...

...
"""

现在开始分析用户的动画观看记录，按上述格式输出锐评报告。
`

    return `
${preset}
用户动画观看记录：(下面的年份是动画发布的年份)
${Object.keys(animeData)
  .map((year) => {
    const items = animeData[year] || []

    if (items.length === 0) return ""

    const sliceItems = items.slice(0, 12)
    const watched = sliceItems
      .filter((item) => selectedAnime.includes(item.title))
      .map((item) => item.title)
      .join(", ")
    const unWatched = sliceItems
      .filter((item) => !selectedAnime.includes(item.title))
      .map((item) => item.title)
      .join(", ")

    return [
      `**${year}年**:`,
      `看过: ${watched || "无"}`,
      `没看过: ${unWatched || "无"}`,
    ]
      .filter(Boolean)
      .join("\n")
  })
  .filter(Boolean)
  .join("\n")}
    `.trim()
  }, [selectedAnime, promptType])

  return (
    <>
      <div className="flex flex-col gap-4 pb-10">
        <div className="p-4 flex flex-col md:items-center ">
          <div
            className="flex flex-col border border-b-0 bg-white w-fit"
            ref={wrapper}
          >
            <div className="border-b justify-between p-2 text-lg  font-bold flex">
              <h1>
                动画世代<span className="remove"> - 点击选择你看过的动画</span>
                <span className="ml-2 text-zinc-400 font-medium">
                  反正我拿我看过的乱做的
                </span>
              </h1>
              <span className="shrink-0 whitespace-nowrap">
                我看过 {selectedAnime.length}/
                {
                  Object.values(animeData).flatMap((year) => {
                    return year.map((item) => item.title).slice(0, 12)
                  }).length
                }{" "}
                部动画
              </span>
            </div>
            {Object.keys(animeData).map((year) => {
              const items = animeData[year] || []
              return (
                <div key={year} className="flex border-b">
                  <div className="bg-red-500 shrink-0 text-white flex items-center font-bold justify-center p-1 size-16 md:size-20 border-black">
                    {year}
                  </div>
                  <div className="flex shrink-0">
                    {items.slice(0, 12).map((item) => {
                      const isSelected = selectedAnime.includes(item.title)
                      return (
                        <button
                          key={item.title}
                          className={`size-16 md:size-20 border-l break-all text-center shrink-0 inline-flex items-center p-1 overflow-hidden justify-center cursor-pointer text-sm  ${
                            isSelected ? "bg-green-500" : "hover:bg-zinc-100"
                          }`}
                          title={item.title}
                          onClick={() => {
                            setSelectedAnime((prev) => {
                              if (isSelected) {
                                return prev.filter(
                                  (title) => title !== item.title
                                )
                              }
                              return [...prev, item.title]
                            })
                          }}
                        >
                          <span className="leading-tight w-full line-clamp-3">
                            {item.title}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex gap-2 justify-center">
          <button
            type="button"
            className="border rounded-md px-4 py-2 inline-flex"
            onClick={() => {
              setSelectedAnime(
                Object.values(animeData).flatMap((year) => {
                  return year.map((item) => item.title).slice(0, 12)
                })
              )
            }}
          >
            全选
          </button>

          {selectedAnime.length > 0 && (
            <button
              type="button"
              className="border rounded-md px-4 py-2 inline-flex"
              onClick={() => {
                setSelectedAnime([])
              }}
            >
              清除
            </button>
          )}

          <button
            type="button"
            className="border rounded-md px-4 py-2 inline-flex"
            onClick={() => {
              toast.promise(copyImage(), {
                success: "复制成功",
                loading: "复制中",
                error(error) {
                  return `复制失败: ${
                    error instanceof Error ? error.message : "未知错误"
                  }`
                },
              })
            }}
          >
            复制图片
          </button>

          <button
            type="button"
            className="border rounded-md px-4 py-2 inline-flex"
            onClick={() => {
              toast.promise(downloadImage(), {
                success: "下载成功",
                loading: "下载中",
                error(error) {
                  return `下载失败: ${
                    error instanceof Error ? error.message : "未知错误"
                  }`
                },
              })
            }}
          >
            下载图片
          </button>
        </div>

        <div className="flex flex-col gap-2 max-w-screen-md w-full mx-auto">
          <div className="border focus-within:ring-2 ring-pink-500 focus-within:border-pink-500 rounded-md">
            <div className="flex items-center justify-between p-2 border-b">
              <div className="flex items-center gap-2">
                <span>锐评提示词</span>
                <select
                  className="border rounded-md"
                  value={promptType}
                  onChange={(e) => {
                    setPromptType(e.currentTarget.value as any)
                  }}
                >
                  <option value="normal">普通</option>
                  <option value="zako">杂鱼❤</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  className="text-sm text-zinc-500 hover:bg-zinc-100 px-1.5 h-7 flex items-center rounded-md"
                  onClick={() => {
                    navigator.clipboard.writeText(prompt)
                    toast.success("复制成功")
                  }}
                >
                  复制
                </button>

                <button
                  type="button"
                  className="text-sm text-zinc-500 hover:bg-zinc-100 px-1.5 h-7 flex items-center rounded-md"
                  onClick={() => {
                    location.href = `chatwise://chat?input=${encodeURIComponent(
                      prompt
                    )}`
                  }}
                >
                  在 ChatWise 中打开 (需要先安装)
                </button>
              </div>
            </div>
            <textarea
              readOnly
              className="outline-none w-full p-2 resize-none cursor-default"
              rows={10}
              value={prompt}
            />
          </div>
        </div>

        <div className="mt-2 text-center">
          由鸡爪的爪机制作，源代码感谢
          <a
            href="https://x.com/localhost_4173"
            target="_blank"
            className="underline"
          >
            低空飞行
          </a>
          老师，
          <a
            href="https://github.com/egoist/anime-sedai"
            target="_blank"
            className="underline"
          >
            查看代码
          </a>
        </div>
      </div>
    </>
  )
}
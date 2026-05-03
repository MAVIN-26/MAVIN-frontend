import InfoPage, { InfoSection } from '../../components/InfoPage'

export default function AboutSubscriptionPage() {
  return (
    <InfoPage title="О подписке и ИИ">
      <p className="text-lg">
        MAVIN — это не только заказ еды, но и умный помощник, который подбирает
        блюда под ваши цели и помогает экономить.
      </p>

      <InfoSection title="ИИ-нутрициолог">
        <p>
          ИИ-нутрициолог — это персональный помощник по питанию внутри MAVIN.
          Он анализирует КБЖУ блюд из меню ресторанов-партнёров и подбирает
          позиции под ваши задачи: набрать массу, снизить вес, поддержать форму
          или просто питаться сбалансированно.
        </p>
        <p>Что умеет ИИ:</p>
        <ul className="list-disc pl-5 flex flex-col gap-1">
          <li>учитывает аллергии и непереносимости;</li>
          <li>фильтрует меню под диету (вегетарианство, без глютена и т.д.);</li>
          <li>советует блюда по бюджету и времени дня;</li>
          <li>отвечает на вопросы о составе и калорийности.</li>
        </ul>
      </InfoSection>

      <InfoSection title="Подписка «Студент+»">
        <p>Сравнение цен с подпиской и без:</p>
        <div className="rounded-xl border border-[#E4E4E4] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#FAFAFA]">
              <tr>
                <th className="text-left px-4 py-2 font-semibold">Что получаете</th>
                <th className="text-left px-4 py-2 font-semibold">Без подписки</th>
                <th className="text-left px-4 py-2 font-semibold">Студент+</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-[#E4E4E4]">
                <td className="px-4 py-2">Средний чек обеда</td>
                <td className="px-4 py-2">350 ₽</td>
                <td className="px-4 py-2 text-[#FF7700] font-semibold">280 ₽</td>
              </tr>
              <tr className="border-t border-[#E4E4E4]">
                <td className="px-4 py-2">Очередь на выдаче</td>
                <td className="px-4 py-2">обычная</td>
                <td className="px-4 py-2 text-[#FF7700] font-semibold">приоритет</td>
              </tr>
              <tr className="border-t border-[#E4E4E4]">
                <td className="px-4 py-2">ИИ-нутрициолог</td>
                <td className="px-4 py-2">—</td>
                <td className="px-4 py-2 text-[#FF7700] font-semibold">включён</td>
              </tr>
            </tbody>
          </table>
        </div>
      </InfoSection>

      <InfoSection title="Сколько можно сэкономить">
        <p>
          При 20 обедах в месяц по подписке «Студент+» экономия составит около
          <strong> 1 400 ₽</strong> — это больше, чем стоимость самой подписки.
          А ещё — меньше времени в очередях и персональный ИИ-помощник в чате.
        </p>
      </InfoSection>
    </InfoPage>
  )
}

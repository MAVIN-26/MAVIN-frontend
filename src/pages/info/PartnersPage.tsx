import InfoPage, { InfoSection } from '../../components/InfoPage'

export default function PartnersPage() {
  return (
    <InfoPage title="Стать партнёром">
      <p className="text-lg text-[#0C0310]">
        MAVIN помогает ресторанам и кафе зарабатывать больше — без курьеров,
        очередей и сложной интеграции.
      </p>

      <InfoSection title="Преимущества">
        <ul className="list-disc pl-5 flex flex-col gap-1">
          <li>
            <strong>Меньше очередей в пиковые часы.</strong> Гости заказывают
            заранее — кухня работает равномерно.
          </li>
          <li>
            <strong>Никаких трат на курьеров.</strong> MAVIN — это
            самовывоз: ресторан только готовит, доставку организует сам гость.
          </li>
          <li>
            <strong>Современная аудитория.</strong> Студенты, офисные сотрудники
            и жители города, которые ценят время.
          </li>
          <li>
            <strong>Прозрачная аналитика.</strong> Статистика заказов, выручки
            и популярных блюд в админ-панели.
          </li>
        </ul>
      </InfoSection>

      <InfoSection title="Как это работает">
        <ol className="list-decimal pl-5 flex flex-col gap-1">
          <li>Вы оставляете заявку — мы связываемся в течение рабочего дня.</li>
          <li>
            Ресторан получает планшет с админ-панелью MAVIN и доступ к личному
            кабинету.
          </li>
          <li>Вы выставляете меню, цены, время приготовления.</li>
          <li>
            Гости оформляют и оплачивают заказы онлайн — вам остаётся только
            приготовить и выдать.
          </li>
        </ol>
      </InfoSection>

      <InfoSection title="Оставить заявку">
        <p>
          Напишите нам на{' '}
          <a
            href="mailto:partners@mavin.ru"
            className="text-[#FF7700] hover:underline"
          >
            partners@mavin.ru
          </a>{' '}
          — укажите название кафе, город, телефон владельца и тип кухни.
          Мы свяжемся с вами и расскажем подробности подключения.
        </p>
      </InfoSection>
    </InfoPage>
  )
}

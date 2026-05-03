import InfoPage, { InfoSection } from '../../components/InfoPage'

export default function ContactsPage() {
  return (
    <InfoPage title="Контакты">
      <InfoSection title="Адрес офиса">
        <p>Университетская площадь, 1, Воронеж</p>
      </InfoSection>

      <InfoSection title="Электронная почта">
        <p>
          Техническая поддержка:{' '}
          <a href="mailto:mavin26.official@yandex.ru" className="text-[#FF7700] hover:underline">
            mavin26.official@yandex.ru
          </a>
        </p>
      </InfoSection>

      <InfoSection title="Телефон">
        <p>
          Горячая линия для покупателей:{' '}
          <a href="tel:+89515427636" className="text-[#FF7700] hover:underline">
            8 (951) 542-76-36
          </a>
        </p>
      </InfoSection>

      <InfoSection title="Реквизиты">
        <p>ООО «МАВИН»</p>
        <p>ИНН 0000000000 / КПП 000000000</p>
        <p>ОГРН 0000000000000</p>
        <p>Юридический адрес: 394018, г. Воронеж, Университетская площадь, 1</p>
      </InfoSection>
    </InfoPage>
  )
}

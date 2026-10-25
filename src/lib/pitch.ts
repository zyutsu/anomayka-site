export interface PitchLead {
  name: string;
  city: string;
}

export function targetName(lead: PitchLead): string {
  const name = (lead.name || "").trim();
  const city = (lead.city || "").trim();
  const generic = ["автосервис", "сто", "автотехцентр", "автосервис, автотехцентр"];

  if (!name || generic.includes(name.toLowerCase())) {
    return city ? "в г. " + city : "";
  }
  return "«" + name + "»";
}

export function fullPitch(lead: PitchLead, shortUrl: string): string {
  const who = targetName(lead);
  const intro = who ? "ваш автосервис " + who : "ваш автосервис";
  return (
    "Здравствуйте!\n\n" +
    "Обратил внимание на " + intro + ". Решил не писать длинных предложений, а сразу показать на деле — собрал для вас готовый сайт с онлайн-записью клиентов, каталогом услуг и точкой на Яндекс.Картах:\n\n" +
    "👉 " + shortUrl + "\n\n" +
    "Сайт полностью адаптирован под смартфоны: клиенты могут в пару кликов выбрать услугу, узнать стоимость и записаться на конкретное время без лишних звонков мастеру.\n\n" +
    "Естественно, это демонстрационный образец — мы можем внести абсолютно любые правки под вас: скорректировать цены и список услуг, поменять дизайн, цвета, поставить ваш реальный логотип и добавить фото боксов.\n\n" +
    "Взгляните с телефона пару минут. Если идея понравится — всё доработаем и запустим под ваш автосервис буквально за 1 день. Как вам такой концепт?"
  );
}

export function shortPitch(lead: PitchLead, shortUrl: string): string {
  const who = targetName(lead);
  const intro = who ? "ваш автосервис " + who : "ваш автосервис";
  return (
    "Здравствуйте! Увидел " + intro + ". Собрал для вас готовый сайт с онлайн-записью и каталогом услуг:\n\n" +
    "👉 " + shortUrl + "\n\n" +
    "Посмотрите с телефона, как вам? Могу поставить ваши точные цены, услуги, логотип и фото — и запустить сайт за один день."
  );
}

/** Абсолютная ссылка на демо-сайт по домену текущего запроса. */
export function demoUrl(origin: string, slug: string): string {
  return origin.replace(/\/$/, "") + "/d/" + slug;
}


type Business = {
  name: string;
};

type Adspace = {
  name: string;
  pricePerWeek?: number;
  business: Business;
};

type ResponseRule = {
  patterns: RegExp[];
  generateResponse: (adspace: Adspace) => string;
};

const rules: ResponseRule[] = [
  {
    patterns: [/cen[ay]?|koszt|opłat[ay]?|ile to kosztuje/i],
    generateResponse: (adspace) => {
      if (adspace.pricePerWeek) {
        return `Cena za ${adspace.name} wynosi ${adspace.pricePerWeek} zł tygodniowo`;
      }
      return `${adspace.name} jest dostępna w systemie barteru. Możemy zaproponować wymianę usług lub towarów - zapraszamy do omówienia`;
    },
  },
  {
    patterns: [/taniej|zniżk[ay]?|rabat|negocjacj[ae]|da się mniej|obniż/i],
    generateResponse: (adspace) => {
      if (adspace.pricePerWeek) {
        return `Cena za ${adspace.name} to ${adspace.pricePerWeek} zł/tydzień. Dla długoterminowych umów możemy rozważyć rabat`;
      }
      return `${adspace.name} jest dostępna w systemie barteru. Zaproponuj nam swoją ofertę wymiany`;
    },
  },
  {
    patterns: [/barter|wymiana|oferta wymiany|zaoferować/i],
    generateResponse: (adspace) => {
      if (adspace.pricePerWeek) {
        return `Możemy rozważyć również opcje barteru dla ${adspace.name}. Zaproponuj nam swoją ofertę`;
      }
      return `${adspace.name} jest dostępna głównie w systemie barteru. Jaka usługa lub towar możesz nam zaproponować`;
    },
  },
  {
    patterns: [/gdzie.*znajduj|lokalizacj|adres|położenie|miejsc/i],
    generateResponse: (adspace) =>
      `${adspace.name} znajduje się w warszawie. Pełne szczegóły lokalizacji są dostępne w opisie oferty`,
  },
  {
    patterns: [/dostępn|rezerwacj|zarezerwow|kiedy/i],
    generateResponse: (adspace) =>
      `${adspace.name} jest dostępna do rezerwacji. Skontaktuj się z nami aby zarezerwować konkretny termin`,
  },
  {
    patterns: [/rozmiar|wymiar|powierzchni|ile metrów|powierzchni|duży|duża|duże/i],
    generateResponse: (adspace) =>
      `Szczegółowe wymiary i powierzchnia ${adspace.name} znajdują się w opisie oferty`,
  },
  {
    patterns: [/opis|szczegół|info|informacja|charakter/i],
    generateResponse: (adspace) =>
      `Pełny opis ${adspace.name} wraz ze wszystkimi szczegółami znajdziesz w karcie oferty`,
  },
  {
    patterns: [/publicznoś|grup|docelowa|do kogo|kto|zasięg|widzenie/i],
    generateResponse: (adspace) =>
      `${adspace.name} ma świetny zasięg i widoczność. Szczegóły o odbiorach dostępne w parametrach oferty`,
  },
  {
    patterns: [/czas|dług|okres|umow|miesiąc|rok/i],
    generateResponse: (adspace) =>
      `Dostępne są elastyczne okresy rezerwacji. Można wynająć od tygodnia do całego roku - do omówienia`,
  },
  {
    patterns: [/oświetleni|noc|podświetl|neon|iluminacj/i],
    generateResponse: (adspace) =>
      `${adspace.name} ma profesjonalne oświetlenie. Szczegóły dostępne w opisie technicznym oferty`,
  },
  {
    patterns: [/ochron|bezpieczeństw|monitoring|kamer/i],
    generateResponse: (adspace) =>
      `Miejsce jest dobrze zabezpieczone. Więcej informacji na temat bezpieczeństwa udzielimy w rozmowie`,
  },
  {
    patterns: [/typ|kategori|format|rodzaj/i],
    generateResponse: (adspace) =>
      `${adspace.name} to powierzchnia wysoko widoczna i atrakcyjna lokalizacyjnie. Typ i format dostępne w karcie`,
  },
  {
    patterns: [/warun|umow|regulamin|zasad/i],
    generateResponse: (adspace) =>
      `Warunki wynajmu są standardowe i elastyczne. Chętnie omówimy wszelkie szczegóły umowy`,
  },
  {
    patterns: [/promocj|oferta specjalna|rabat|zniżk|akcj/i],
    generateResponse: (adspace) =>
      `Mamy różne opcje promocyjne i pakiety. Sprawdź jakie warunki możemy Ci zaproponować`,
  },
  {
    patterns: [/kontrakt|podpis|umow|formaln/i],
    generateResponse: (adspace) =>
      `Zapraszamy do omówienia szczegółów i sformalizowania umowy. Procedura jest prosta i przejrzysta`,
  },
  {
    patterns: [/support|pomoc|pytani|wiadom/i],
    generateResponse: (adspace) =>
      `Chętnie odpowiadamy na wszystkie pytania. Jeśli masz jakiekolwiek wątpliwości, daj nam znać`,
  },
  {
    patterns: [
      /cześć|hej|elo|witaj|hi|hello|siema|hejka|yo|yoł|dobry|uszanowanko|dzień dobry|witam/i,
    ],
    generateResponse: (adspace) =>
      `Cześć! Witaj w czacie. Pytaj mnie o wszystko dotyczące ${adspace.name}. Chętnie Ci pomogę`,
  },
  {
    patterns: [/dzięk|spasibo|dzięki mord|super/i],
    generateResponse: (adspace) =>
      `Nie ma za co! Jeśli będziesz mieć jeszcze pytania, zawsze chętnie Ci odpowiem`,
  },
];

export function findMatchingResponse(message: string, adspace: Adspace): string | null {
  for (const rule of rules) {
    if (rule.patterns.some((pattern) => pattern.test(message))) {
      return rule.generateResponse(adspace);
    }
  }
  return null;
}

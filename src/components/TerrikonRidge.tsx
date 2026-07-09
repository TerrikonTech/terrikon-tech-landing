// Гребень терриконов — горизонт перед футером: контурные силуэты отвалов
// с редкой штриховкой склонов и сигнальным огоньком на мачте главного конуса.
// Локальный мотив студии (террикон = донецкий отвал), рисован руками, не иконка.
export default function TerrikonRidge() {
  return (
    <div aria-hidden="true" className="w-full overflow-hidden bg-[#0C0C0C]">
      <svg
        viewBox="0 0 1440 190"
        className="block h-auto w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g stroke="#BBCCD7" strokeOpacity="0.3" strokeWidth="1.5">
          {/* Дальний малый конус слева, срезан краем */}
          <path d="M-40 190 L30 132 L58 118 L96 138 L178 190" />
          {/* Главный конус */}
          <path d="M150 190 L300 96 L358 44 L418 30 L472 58 L560 104 L700 190" />
          {/* Средний конус справа */}
          <path d="M740 190 L868 108 L948 72 L1002 92 L1092 142 L1188 190" />
          {/* Дальний конус у правого края */}
          <path d="M1160 190 L1266 124 L1318 112 L1382 148 L1440 178" />
        </g>
        {/* Штриховка склонов — намёк на слоистость отвала */}
        <g stroke="#BBCCD7" strokeOpacity="0.12" strokeWidth="1">
          <path d="M340 70 L390 96" />
          <path d="M300 108 L364 140" />
          <path d="M448 62 L500 94" />
          <path d="M930 92 L980 120" />
          <path d="M1290 128 L1330 152" />
        </g>
        {/* Мачта с сигнальным огоньком на вершине главного конуса */}
        <path d="M418 30 L418 14" stroke="#BBCCD7" strokeOpacity="0.4" strokeWidth="1.5" />
        <circle cx="418" cy="11" r="3.5" fill="#FF6A00" />
      </svg>
    </div>
  )
}

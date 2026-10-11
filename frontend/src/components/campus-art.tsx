export function CampusArt({ variant = 0 }: { variant?: number }) {
  const palettes = [
    ["#dce4d7", "#b9c9ad", "#3b6652", "#f6efdc"],
    ["#f0d8c7", "#d4a792", "#855c47", "#fff1db"],
    ["#dbe7ea", "#adc8d0", "#486e7b", "#f3eee0"],
    ["#ece9c9", "#ccca97", "#667045", "#faf3dc"],
  ];
  const [sky, ground, ink, stone] = palettes[variant % palettes.length];
  return (
    <svg viewBox="0 0 400 240" className="campus-art" aria-hidden="true">
      <rect width="400" height="240" fill={sky} />
      <circle cx="325" cy="54" r="28" fill={stone} />
      <path d="M0 191Q100 150 205 190T400 176V240H0Z" fill={ground} />
      <path
        d="M45 206V107H163V206M237 206V107H355V206"
        fill={stone}
        stroke={ink}
        strokeWidth="2"
      />
      <path
        d="M148 207V89L200 57L252 89V207"
        fill={stone}
        stroke={ink}
        strokeWidth="2"
      />
      <path
        d="M138 94L200 52L262 94M42 106H151M248 106H358"
        fill="none"
        stroke={ink}
        strokeWidth="5"
      />
      {[62, 99, 273, 310].map((x) => (
        <g key={x} fill={ink}>
          <rect x={x} y="124" width="20" height="28" rx="10" />
          <rect x={x} y="167" width="20" height="26" rx="1" />
        </g>
      ))}
      <path d="M181 207V163A19 19 0 0138 0V207Z" fill={ink} />
      <circle
        cx="200"
        cy="109"
        r="14"
        fill="none"
        stroke={ink}
        strokeWidth="2"
      />
      <path d="M200 99V109L207 113" fill="none" stroke={ink} strokeWidth="2" />
      <path
        d="M157 209H243M148 216H252M134 224H266"
        stroke={ink}
        strokeWidth="2"
      />
      {[22, 375].map((x) => (
        <g key={x}>
          <path d={`M${x} 206v-56`} stroke={ink} strokeWidth="4" />
          <ellipse cx={x} cy="146" rx="19" ry="36" fill={ink} />
        </g>
      ))}
    </svg>
  );
}

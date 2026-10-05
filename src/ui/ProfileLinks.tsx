import { Github, Linkedin } from 'lucide-react'

const profiles = [
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/bodhiswattwa-chakraborty-56b890199/',
    icon: <Linkedin aria-hidden="true" size={19} strokeWidth={1.6} />,
  },
  {
    name: 'Twitter / X',
    href: 'https://x.com/BodhiswattwaCh2',
    icon: (
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.64 7.584H.47l8.6-9.835L0 1.154h7.594l5.243 6.932 6.064-6.933ZM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644Z" />
      </svg>
    ),
  },
  {
    name: 'GitHub',
    href: 'https://github.com/lord-Rheagar',
    icon: <Github aria-hidden="true" size={20} strokeWidth={1.6} />,
  },
]

export default function ProfileLinks() {
  return (
    <nav className="profile-links" aria-label="Social profiles">
      {profiles.map(({ name, href, icon }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${name} (opens in a new tab)`}
          title={name}
        >
          {icon}
        </a>
      ))}
    </nav>
  )
}

import { Link } from 'react-router-dom'
import { usePreferences } from '../context/usePreferences'
import './DemoNotice.css'

// Explain disabled features instead of showing a form that cannot succeed.
export default function DemoNotice({ blocked = false }: { blocked?: boolean }) {
  const { language } = usePreferences()
  const english = language === 'en'
  return (
    <section className="demo-notice" aria-label={english ? 'Portfolio demo' : 'დემო ვერსია'}>
      <strong>
        {english ? 'Portfolio demo — fictional jobs' : 'დემო ვერსია — გამოგონილი განცხადებები'}
      </strong>
      <p>
        {english
          ? 'Browse, search and open sample jobs. Accounts, posting, contacts and accepting jobs are disabled.'
          : 'დაათვალიერე და მოძებნე სანიმუშო განცხადებები. ანგარიშები, გამოქვეყნება, კონტაქტები და სამუშაოს მიღება გამორთულია.'}
      </p>
      {blocked && <Link to="/">{english ? 'Browse sample jobs' : 'განცხადებების ნახვა'}</Link>}
    </section>
  )
}

import type { Job } from './types'

// Fictional, public sample data only. Never copy account/contact data or secrets here.
// Empty images use JobCard's built-in category placeholder, so no upload server is needed.
const examples = [
  [
    'Apartment cleaning / ბინის დასუფთავება',
    'Cleaning',
    'Tbilisi',
    80,
    'Clean a two-room apartment, kitchen and bathroom. Supplies provided. / ოროთახიანი ბინის, სამზარეულოსა და აბაზანის დასუფთავება.',
  ],
  [
    'Furniture assembly / ავეჯის აწყობა',
    'Repairs',
    'Tbilisi',
    120,
    'Assemble a flat-pack desk and two shelves. Bring basic tools. / მაგიდისა და ორი თაროს აწყობა.',
  ],
  [
    'Help moving boxes / ყუთების გადატანა',
    'Moving',
    'Batumi',
    100,
    'Carry packed boxes between apartments in the same building. / შეფუთული ყუთების გადატანა იმავე კორპუსში.',
  ],
  [
    'Local delivery / ადგილზე მიტანა',
    'Delivery',
    'Kutaisi',
    30,
    'Deliver a small parcel within the city during the afternoon. / პატარა ამანათის მიტანა ქალაქის ფარგლებში.',
  ],
  [
    'Garden care / ბაღის მოვლა',
    'Gardening',
    'Rustavi',
    90,
    'Remove weeds and tidy a small courtyard. / პატარა ეზოს მოწესრიგება და სარეველების მოცილება.',
  ],
  [
    'Room painting / ოთახის შეღებვა',
    'Painting',
    'Tbilisi',
    200,
    'Prepare and paint one room. Paint is supplied. / ერთი ოთახის მომზადება და შეღებვა.',
  ],
  [
    'English tutoring / ინგლისურის გაკვეთილი',
    'Tutoring',
    'Batumi',
    40,
    'One-hour conversational English lesson for a beginner. / ერთსაათიანი სასაუბრო ინგლისურის გაკვეთილი დამწყებისთვის.',
  ],
  [
    'Event assistance / ღონისძიებაზე დახმარება',
    'Other',
    'Kutaisi',
    75,
    'Help set up chairs and welcome guests at a small event. / ღონისძიებისთვის სკამების განლაგება და სტუმრების მიღება.',
  ],
  [
    'Window washing / ფანჯრების წმენდა',
    'Cleaning',
    'Batumi',
    65,
    'Wash accessible windows from inside an apartment. / ბინის ფანჯრების შიდა მხრიდან გაწმენდა.',
  ],
  [
    'Door handle repair / კარის სახელურის შეკეთება',
    'Repairs',
    'Rustavi',
    45,
    'Replace a loose interior door handle. / შიდა კარის მოშვებული სახელურის შეცვლა.',
  ],
  [
    'Move a sofa / დივნის გადატანა',
    'Moving',
    'Tbilisi',
    150,
    'Two helpers needed to move a sofa; lift available. / ორი დამხმარე დივნის გადასატანად; ლიფტი ხელმისაწვდომია.',
  ],
  [
    'Grocery delivery / პროდუქტების მიტანა',
    'Delivery',
    'Batumi',
    25,
    'Collect a prepared grocery order and deliver nearby. / გამზადებული პროდუქტების შეკვეთის ახლოს მიტანა.',
  ],
  [
    'Plant repotting / მცენარეების გადარგვა',
    'Gardening',
    'Kutaisi',
    55,
    'Repot six houseplants; pots and soil provided. / ექვსი ოთახის მცენარის გადარგვა.',
  ],
  [
    'Fence painting / ღობის შეღებვა',
    'Painting',
    'Rustavi',
    180,
    'Prepare and repaint a small wooden garden fence. / პატარა ხის ღობის მომზადება და შეღებვა.',
  ],
  [
    'Math tutoring / მათემატიკის გაკვეთილი',
    'Tutoring',
    'Tbilisi',
    35,
    'Help a school student practise algebra for one hour. / მოსწავლის დახმარება ალგებრაში, ერთი საათი.',
  ],
  [
    'Dog walking / ძაღლის გასეირნება',
    'Other',
    'Batumi',
    20,
    'Walk a friendly dog for 45 minutes in a local park. / მეგობრული ძაღლის გასეირნება პარკში 45 წუთით.',
  ],
  [
    'Office cleaning / ოფისის დასუფთავება',
    'Cleaning',
    'Kutaisi',
    110,
    'Clean a small office after working hours. / პატარა ოფისის დასუფთავება სამუშაო საათების შემდეგ.',
  ],
  [
    'Bicycle adjustment / ველოსიპედის გამართვა',
    'Repairs',
    'Tbilisi',
    50,
    'Adjust brakes and gears on a city bicycle. / ქალაქის ველოსიპედის მუხრუჭებისა და სიჩქარეების გამართვა.',
  ],
  [
    'Python lesson / პითონის გაკვეთილი',
    'Tutoring',
    'Rustavi',
    45,
    'Introduce variables, loops and functions in a one-hour lesson. / ცვლადების, ციკლებისა და ფუნქციების შესწავლა.',
  ],
  [
    'Product photography / პროდუქტის ფოტოგადაღება',
    'Other',
    'Tbilisi',
    130,
    'Photograph ten handmade items against a simple background. / ათი ხელნაკეთი ნივთის ფოტოგადაღება მარტივ ფონზე.',
  ],
] as const

export const demoJobs: Job[] = examples.map(
  ([title, category, city, price, description], index) => ({
    _id: `demo-job-${index + 1}`,
    title,
    description: `${description} Fictional portfolio listing — not a real job. / გამოგონილი განცხადება.`,
    category,
    city,
    street: '',
    price,
    currency: 'GEL',
    priceType: category === 'Tutoring' ? 'hourly' : 'fixed',
    images: [],
    status: 'open',
    postedBy: { _id: 'demo-poster', name: 'Demo poster / დემო ავტორი' },
    createdAt: `2026-11-${String(27 - index).padStart(2, '0')}T10:00:00.000Z`,
  }),
)

// Mirrors the read-only API shape so existing cards/search can be reused.
// There is deliberately no fallback to fetch: unsupported requests must not reach a server.
export function readDemoRequest(path: string, method = 'GET'): unknown {
  if (method.toUpperCase() !== 'GET') throw new Error('Changes are unavailable in this demo.')
  const url = new URL(path, 'https://demo.invalid')
  if (url.pathname === '/jobs') {
    const q = (url.searchParams.get('q') ?? '').trim().toLowerCase()
    const city = (url.searchParams.get('city') ?? '').trim().toLowerCase()
    const category = url.searchParams.get('category')
    const page = Number(url.searchParams.get('page') ?? 1)
    if (!Number.isSafeInteger(page) || page < 1) throw new Error('Invalid page number.')
    const aliases: Record<string, string> = {
      თბილისი: 'tbilisi',
      ბათუმი: 'batumi',
      ქუთაისი: 'kutaisi',
      რუსთავი: 'rustavi',
    }
    const matches = demoJobs.filter(
      (job) =>
        `${job.title} ${job.description}`.toLowerCase().includes(q) &&
        job.city.toLowerCase().includes(aliases[city] ?? city) &&
        (!category || category === 'All' || job.category === category),
    )
    const pageSize = 8
    const offset = (page - 1) * pageSize
    return structuredClone({
      jobs: matches.slice(offset, offset + pageSize),
      hasMore: offset + pageSize < matches.length,
    })
  }
  const match = /^\/jobs\/(demo-job-\d+)$/.exec(url.pathname)
  const job = match && demoJobs.find((item) => item._id === match[1])
  if (job) return structuredClone({ job })
  throw new Error('This page is unavailable in the portfolio demo.')
}

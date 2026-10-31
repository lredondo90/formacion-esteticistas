// Editorial photography for the academy. Free photos from Unsplash (unsplash.com/license:
// free for commercial use, no attribution required), served from their CDN at the size each
// slot needs. Replace any id with Belaura's own photos when they exist.

const UNSPLASH = 'https://images.unsplash.com/'

export function photo(id: string, width: number, height?: number): string {
  const size = height ? `&h=${height}` : ''
  return `${UNSPLASH}${id}?auto=format&fit=crop&q=70&w=${width}${size}`
}

/** Hero and section photos. */
export const PHOTOS = {
  hero: 'photo-1570172619644-dfd03ed5d881', // facial mask treatment at a spa
  heroDetail: 'photo-1585945037805-5fd82c2e60b1', // cream texture on beige
  mentor: 'photo-1761718210055-e83ca7e2c9ad', // beautician applying a facial mask
}

/** One cover photo per course id. */
export const COURSE_PHOTOS: Record<string, string> = {
  microblading: 'photo-1674049406179-d7bf2c263e71', // eyebrows done by a professional
  pestanas: 'photo-1589710751893-f9a6770ad71b', // applying eyelash extensions
  unas: 'photo-1632345031435-8727f6897d53', // manicure at a nail salon
  'faciales-avanzados': 'photo-1552693673-1bf958298935', // facial skincare treatment
  'masaje-drenaje': 'photo-1544161515-4ab6ce6db874', // spa massage
  laser: 'photo-1700760933574-9f0f4ea9aa3b', // laser hair removal device
  maquillaje: 'photo-1709477542149-f4e0e21d590b', // make-up applied with a brush
  cosmetologia: 'photo-1608571423902-eed4a5ad8108', // serum dropper bottle
  'gestion-marketing': 'photo-1626383137804-ff908d2753a2', // salon owner in her salon
  'atencion-venta': 'photo-1552046122-03184de85e08', // choosing skincare products
  'tipos-de-piel': 'photo-1519415387722-a1c3bbef716c', // close-up of skin
  'higiene-cabina': 'photo-1695527081827-fdbc4e77be9b', // clean treatment room
  depilacion: 'photo-1544717304-a2db4a7b16ee', // client in a white towel
}

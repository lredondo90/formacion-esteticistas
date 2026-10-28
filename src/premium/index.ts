import type { Course } from '../courses'
import { business } from './business'
import { cosmetology } from './cosmetology'
import { facials } from './facials'
import { laser } from './laser'
import { lashes } from './lashes'
import { makeup } from './makeup'
import { massage } from './massage'
import { microblading } from './microblading'
import { nails } from './nails'
import { sales } from './sales'

// Ordered by market demand.
export const PREMIUM_COURSES: Course[] = [
  microblading,
  lashes,
  nails,
  facials,
  massage,
  laser,
  makeup,
  cosmetology,
  business,
  sales,
]

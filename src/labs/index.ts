import { businessLab } from './business'
import { cosmetologyLab } from './cosmetology'
import type { LabDef } from './engine'
import { facialsLab } from './facials'
import { laserLab } from './laser'
import { lashesLab } from './lashes'
import { makeupLab } from './makeup'
import { massageLab } from './massage'
import { nailsLab } from './nails'
import { salesLab } from './sales'
import { skinLab } from './skin'

// Every course's guided practice. The brow lab predates the shared engine and keeps its own component.
export const LABS = {
  skin: skinLab,
  lashes: lashesLab,
  nails: nailsLab,
  makeup: makeupLab,
  massage: massageLab,
  facials: facialsLab,
  laser: laserLab,
  cosmetology: cosmetologyLab,
  sales: salesLab,
  business: businessLab,
} satisfies Record<string, LabDef>

export type LabId = keyof typeof LABS | 'brows'

import React from 'react'
import Controller from '../../../../controller'
import { lazy } from '../../../../hoc/lazy'

const components = {
  A: lazy(() => import('./A')),
  B: lazy(() => import('./B')),
  C: lazy(() => import('./C')),
  D: lazy(() => import('./D')),
  E: lazy(() => import('./E')),
}

export default class extends Controller {
  View = View
  async loadComponents() {
    await Promise.all([
      components.A.load(),
      components.B.load(),
      components.C.load(),
    ])
  }
  async componentWillCreate() {
    await this.loadComponents()
  }
  async viewWillHydrate() {
    await this.loadComponents()
  }
}

type ViewProps = {}

function View({}: ViewProps) {
  return (
    <div>
      <button
        onClick={() => {
          components.D.load()
        }}
      >
        load D
      </button>
      <button
        onClick={() => {
          components.E.load()
        }}
      >
        load E
      </button>
      <components.A count={1} />
      <components.B count={2} />
      <components.C count={3} />
      <components.D count={4} fallback={<div>fallback for d</div>} />
      <components.E count={5} fallback={<div>fallback for e</div>} />
    </div>
  )
}

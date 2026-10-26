import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, mkdtempSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const sample = (n) => readFileSync(new URL(`../samples/${n}`, import.meta.url), 'utf8')
const mod = (n) => import(`../src/${n}.mjs`)
const run = (n, args = []) => spawnSync(process.execPath, [fileURLToPath(new URL(`../src/${n}.mjs`, import.meta.url)), ...args], { encoding: 'utf8' })
const samplePath = (n) => fileURLToPath(new URL(`../samples/${n}`, import.meta.url))

test('17 changelog : types, portée, changement incompatible, autres', async () => {
  const { parseCommits, renderChangelog } = await mod('git-changelog')
  const log = ['a1\u001ffeat(api): ajoute la pagination\u001f', 'b2\u001ffix: corrige le fuseau\u001f', 'c3\u001frefactor(db)!: change le schéma\u001f', 'd4\u001ffeat: nouvelle option\u001fBREAKING CHANGE: ancienne option retirée', 'e5\u001fMise à jour du README\u001f'].join('\u001e')
  const commits = parseCommits(log)
  assert.equal(commits.length, 5); assert.equal(commits[0].scope, 'api'); assert.equal(commits[2].breaking, true); assert.equal(commits[3].breaking, true); assert.equal(commits[4].type, 'other')
  const md = renderChangelog(commits, { title: 'v1.2.0', date: '2026-10-26' })
  assert.match(md, /## v1.2.0 — 2026-10-26/); assert.match(md, /### Changements incompatibles[\s\S]*c3[\s\S]*d4/); assert.match(md, /### Nouveautés\n\n- \*\*api\*\* : ajoute la pagination/); assert.match(md, /### Autres changements[\s\S]*README/)
  assert.match(renderChangelog([], {}), /Aucun changement/)
})

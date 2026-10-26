#!/usr/bin/env node
/* Génère un CHANGELOG Markdown à partir des commits « conventionnels » (feat:, fix:, perf:…) entre deux références Git. */
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { isMain, parseArgs, usage, fail } from '../lib/cli.mjs'

const SECTIONS = [
  ['breaking', 'Changements incompatibles'], ['feat', 'Nouveautés'], ['fix', 'Corrections'], ['perf', 'Performances'],
  ['refactor', 'Refonte'], ['docs', 'Documentation'], ['test', 'Tests'], ['build', 'Build'], ['ci', 'Intégration continue'], ['chore', 'Maintenance'],
]
const US = '\u001f'
const RS = '\u001e'

/** Entrée : sortie de `git log --pretty=format:%h<US>%s<US>%b<RS>`. */
export function parseCommits(log) {
  return log.split(RS).map((c) => c.trim()).filter(Boolean).map((chunk) => {
    const [hash, subject = '', body = ''] = chunk.split(US)
    const m = subject.match(/^(\w+)(?:\(([^)]+)\))?(!)?:\s*(.+)$/)
    const breaking = Boolean(m?.[3]) || /BREAKING[ -]CHANGE/.test(body)
    return m
      ? { hash, type: m[1].toLowerCase(), scope: m[2] ?? '', breaking, text: m[4] }
      : { hash, type: 'other', scope: '', breaking, text: subject }
  })
}

export function renderChangelog(commits, { title = 'Changelog', date = '' } = {}) {
  const out = [`## ${title}${date ? ` — ${date}` : ''}`, '']
  const section = (heading, items) => {
    if (!items.length) return
    out.push(`### ${heading}`, '', ...items.map((c) => `- ${c.scope ? `**${c.scope}** : ` : ''}${c.text} (\`${c.hash}\`)`), '')
  }
  section(SECTIONS[0][1], commits.filter((c) => c.breaking))
  for (const [type, heading] of SECTIONS.slice(1)) section(heading, commits.filter((c) => c.type === type && !c.breaking))
  section('Autres changements', commits.filter((c) => c.type === 'other' && !c.breaking))
  if (out.length === 2) out.push('_Aucun changement._', '')
  return out.join('\n')
}

const git = (...a) => execFileSync('git', a, { encoding: 'utf8' }).trim()

if (isMain(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2), ['help'])
  usage(`
Usage : node src/git-changelog.mjs [--from <tag|commit>] [--to HEAD] [--title "v1.2.0"] [--out CHANGELOG.md]
Sans --from : depuis le dernier tag (ou tout l'historique s'il n'y en a pas). Les « merges » sont ignorés.`, { ...args, _: ['x'] })
  let from = args.from
  try {
    if (!from) { try { from = git('describe', '--tags', '--abbrev=0') } catch { from = '' } }
    const range = from ? `${from}..${args.to ?? 'HEAD'}` : (args.to ?? 'HEAD')
    const log = execFileSync('git', ['log', '--no-merges', `--pretty=format:%h${US}%s${US}%b${RS}`, range], { encoding: 'utf8' })
    const md = renderChangelog(parseCommits(log), { title: args.title ?? (args.to ?? 'Unreleased'), date: new Date().toISOString().slice(0, 10) })
    if (args.out) writeFileSync(args.out, md); else process.stdout.write(md + '\n')
  } catch (e) { fail(`git a échoué (${String(e.message).split('\n')[0]})`) }
}

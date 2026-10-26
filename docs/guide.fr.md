## À quoi ça sert

Rédiger les notes de version à la main prend du temps et on oublie des changements. Si vos messages de commit suivent la convention « conventional commits » (`feat:`, `fix:`, `perf:`…), ce script produit un changelog Markdown propre, regroupé par type, entre deux références Git.

## Avant de commencer

- Git installé et un dépôt avec un historique.
- Des messages de commit de la forme `type(portée): description`. Un `!` après le type (`feat!:`) ou une ligne `BREAKING CHANGE:` dans le corps marque un changement incompatible.

## Pas à pas

1. Depuis la racine du dépôt :
   ```bash
   node src/git-changelog.mjs --from v1.1.0 --to HEAD --title "v1.2.0"
   ```
2. Sans `--from`, le script part du dernier tag ; sans tag, de tout l'historique.
3. Ajoutez `--out CHANGELOG.md` pour écrire un fichier, ou collez le résultat dans la page de release.

## Lire le résultat

Les sections apparaissent dans cet ordre : changements incompatibles, nouveautés, corrections, performances, refonte, documentation, tests, build, intégration continue, maintenance. Les commits qui ne suivent pas la convention vont dans « Autres changements » : c'est le signal qu'il faut soigner les messages.

## L'automatiser

À chaque tag, dans une CI : générez le changelog et attachez-le à la release. Les commits de fusion (« merges ») sont ignorés.

## Pièges à éviter

- Le script **lit** votre historique, il ne le réécrit pas ; il ne crée ni tag ni commit.
- Un message mal typé (`feature:` au lieu de `feat:`) tombera dans « Autres changements ».

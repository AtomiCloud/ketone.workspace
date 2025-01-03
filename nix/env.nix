{ pkgs, packages }:
with packages;
{
  system = [
    coreutils
    findutils
    gnugrep
    gnused
    jq
    yq
  ];

  dev = [
    pls
    git
  ];

  main = [
    infisical
    bun
  ];

  lint = [
    # core
    treefmt
    shellcheck
  ];

  releaser = [
  ];
}

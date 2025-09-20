{ pkgs, pkgs-2505, pkgs-unstable, atomi }:
let

  all = {
    atomipkgs = (
      with atomi;
      {
        inherit
          atomiutils
          cyanprint
          sg
          pls;
      }
    );
    nix-unstable = (
      with pkgs-unstable;
      { }
    );
    nix-2505 = (
      with pkgs-2505;
      {

        inherit

          git

          infisical
          bun
          biome

          treefmt
          shellcheck
          ;
      }
    );
  };
in
with all;
nix-2505 //
nix-unstable //
atomipkgs

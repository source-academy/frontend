{
  description = "Template for a direnv shell";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = {
    self,
    nixpkgs,
  }: let
    system = "x86_64-linux";
    pkgs = nixpkgs.legacyPackages.${system};
    lib = pkgs.lib;
    nodeDependencies = pkgs.callPackage ./default.nix {};
  in {
    packages.${system} = let
      label =
        if self.sourceInfo ? lastModifiedDate && self.sourceInfo ? shortRev
        then "${nixpkgs.lib.substring 0 8 self.sourceInfo.lastModifiedDate}.${self.sourceInfo.shortRev}"
        else nixpkgs.lib.warn "Repo is dirty, revision will not be available in Navigation Bar" "dirty";
    in {
      static = pkgs.stdenv.mkDerivation {
        name = "frontend-static";
        src = ./.;

        buildInputs = [pkgs.yarn-berry pkgs.bubblewrap];
        buildPhase = ''
          ln -s ${nodeDependencies}/node_modules ./node_modules
          export PATH="${nodeDependencies}/bin:$PATH"
          cp $src/env/env.for-cloud .env
          sed -i 's/git-commit-here/${label}/' src/commons/navigationBar/NavigationBar.tsx
          yarn run build
        '';
        installPhase = ''
          cp -r build $out/
        '';
      };

      start = pkgs.writeShellScriptBin "frontend-start" ''
        rm -rf node_modules
        mkdir node_modules
        ln -s ${nodeDependencies}/node_modules/{.*,*} ./node_modules/
        ${pkgs.yarn-berry}/bin/yarn run start
      '';

      default = self.outputs.packages.${system}.start;
    };
  };
}

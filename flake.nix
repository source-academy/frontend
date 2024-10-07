{
  description = "Template for a direnv shell, with NodeJS";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/24.05";
  };

  outputs = { self, nixpkgs }:
  let
    system = "x86_64-linux";
    pkgs = nixpkgs.legacyPackages.${system};
    libs = with pkgs; [
      libuuid
      xorg.libX11
      xorg.libXext
    ];
  in
  {
    devShells.${system}.default = pkgs.mkShell {
      packages = with pkgs; [
        nodejs_20
        yarn

        # Additional libs needed by yarn when installing
        pkg-config
        xorg.libX11
        xorg.libXi
        libGL

        python310
        xorg.libXext

        gcc11
      ];
      shellHook = ''
        # Inject the libraries
        export LD_LIBRARY_PATH=${pkgs.stdenv.cc.cc.lib}/lib/
        export LD_LIBRARY_PATH="${pkgs.lib.makeLibraryPath libs}:$LD_LIBRARY_PATH"
      '';
    };
  };
}



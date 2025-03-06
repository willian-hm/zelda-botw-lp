document.addEventListener("DOMContentLoaded", function () {
    let backgroundAudio = document.getElementById("backgroundAudio");
    let buttonSound = document.getElementById("buttonSound");
    let blurEffect = document.getElementById("blurEffect");

    // Função para tocar a música de fundo ao carregar
    function playBackgroundMusic() {
        backgroundAudio.volume = 0.5;
        backgroundAudio.play().catch(error => {
            console.log("Autoplay bloqueado. Tentando novamente...");
            document.addEventListener("click", () => backgroundAudio.play(), { once: true });
        });
    }

    // Inicia a música de fundo quando a página carregar
    playBackgroundMusic();

    // Evento de clique no botão "Iniciar Aventura"
    document.querySelector(".btn-start").addEventListener("click", function () {
        // Toca o som do botão
        buttonSound.play();

        // Torna o blur visível e aplica o efeito de blur
        blurEffect.style.display = "block"; // Torna o blur visível
        setTimeout(() => {
            blurEffect.classList.add("blur-active"); // Aplica o efeito de blur
        }, 10); // Um pequeno delay para garantir que a mudança de display seja aplicada antes da animação

        // Aguarda o fim do som do botão para redirecionar
        buttonSound.onended = function () {
            // Adiciona um atraso para permitir que o efeito de blur termine
            setTimeout(() => {
                window.location.href = "inicio.html"; // Redireciona para a página de início
            }, 500); // 500ms após o som terminar
        };

        // Gradualmente diminui o volume da música de fundo
        let fadeOut = setInterval(() => {
            if (backgroundAudio.volume > 0.05) {
                backgroundAudio.volume -= 0.05;
            } else {
                clearInterval(fadeOut);
                backgroundAudio.pause(); // Pausa a música de fundo
            }
        }, 100);
    });
});

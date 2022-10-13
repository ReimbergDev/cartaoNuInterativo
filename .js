var VanillaTilt = (function () {
    'usar estrito';
    
    /**
     * Criado por Sergiu Șandor (micku7zu) em 27/01/2017.
     * Ideia original: https://github.com/gijsroge/tilt.js
     * Licença MIT.
     * Versão 1.7.2
     */
    
    class VanillaTilt {
      construtor(elemento, configurações = {}) {
        if (!(elemento instância do Nó)) {
          throw ("Não é possível inicializar VanillaTilt porque " + element + " não é um Node.");
        }
    
        this.width = null;
        esta.altura = null;
        this.clientWidth = null;
        this.clientHeight = null;
        this.left = null;
        this.top = null;
    
        // para amostragem de giroscópio
        this.gammazero = null;
        this.betazero = null;
        this.lastgammazero = null;
        this.lastbetazero = null;
    
        this.transitionTimeout = null;
        this.updateCall = null;
        este.evento = null;
    
        this.updateBind = this.update.bind(this);
        this.resetBind = this.reset.bind(this);
    
        este.elemento = elemento;
        this.settings = this.extendSettings(configurações);
    
        this.reverse = this.settings.reverse ? -1: 1;
        this.glare = VanillaTilt.isSettingTrue(this.settings.glare);
        this.glarePrerender = VanillaTilt.isSettingTrue(this.settings["glare-prerender"]);
        this.fullPageListening = VanillaTilt.isSettingTrue(this.settings["full-page-listening"]);
        this.gyroscope = VanillaTilt.isSettingTrue(this.settings.gyroscope);
        this.gyroscopeSamples = this.settings.gyroscopeSamples;
    
        this.elementListener = this.getElementListener();
    
        if (this.glare) {
          this.prepareGlare();
        }
    
        if (this.fullPageListening) {
          this.updateClientSize();
        }
    
        this.addEventListeners();
        this.reset();
        this.updateInitialPosition();
      }
    
      static isSettingTrue(setting) {
        configuração de retorno === "" || configuração === verdadeiro || configuração === 1;
      }
    
      /**
       * Método retorna o elemento que serão os eventos do mouse de escuta
       * @return {Nó}
       */
      getElementListener() {
        if (this.fullPageListening) {
          retornar janela.document;
        }
    
        if (typeof this.settings["mouse-event-element"] === "string") {
          const mouseEventElement = document.querySelector(this.settings["mouse-event-element"]);
    
          if (mouseEventElement) {
            return mouseEventElement;
          }
        }
    
        if (this.settings["mouse-event-element"] instanceof Node) {
          return this.settings["mouse-event-element"];
        }
    
        retorne este.elemento;
      }
    
      /**
       * Método definir métodos de escuta para this.elementListener
       * @return {Nó}
       */
      addEventListeners() {
        this.onMouseEnterBind = this.onMouseEnter.bind(this);
        this.onMouseMoveBind = this.onMouseMove.bind(this);
        this.onMouseLeaveBind = this.onMouseLeave.bind(this);
        this.onWindowResizeBind = this.onWindowResize.bind(this);
        this.onDeviceOrientationBind = this.onDeviceOrientation.bind(this);
    
        this.elementListener.addEventListener("mouseenter", this.onMouseEnterBind);
        this.elementListener.addEventListener("mouseleave", this.onMouseLeaveBind);
        this.elementListener.addEventListener("mousemove", this.onMouseMoveBind);
    
        if (this.glare || this.fullPageListening) {
          window.addEventListener("resize", this.onWindowResizeBind);
        }
    
        if (this.giroscópio) {
          window.addEventListener("deviceorientation", this.onDeviceOrientationBind);
        }
      }
    
      /**
       * Método remove ouvintes de eventos do this.elementListener atual
       */
      removeEventListeners() {
        this.elementListener.removeEventListener("mouseenter", this.onMouseEnterBind);
        this.elementListener.removeEventListener("mouseleave", this.onMouseLeaveBind);
        this.elementListener.removeEventListener("mousemove", this.onMouseMoveBind);
    
        if (this.giroscópio) {
          window.removeEventListener("deviceorientation", this.onDeviceOrientationBind);
        }
    
        if (this.glare || this.fullPageListening) {
          window.removeEventListener("resize", this.onWindowResizeBind);
        }
      }
    
      destruir() {
        clearTimeout(this.transitionTimeout);
        if (this.updateCall !== null) {
          cancelAnimationFrame(this.updateCall);
        }
    
        this.reset();
    
        this.removeEventListeners();
        this.element.vanillaTilt = null;
        delete this.element.vanillaTilt;
    
        este.elemento = null;
      }
    
      onDeviceOrientation(evento) {
        if (evento.gama === nulo || evento.beta === nulo) {
          Retorna;
        }
    
        this.updateElementPosition();
    
        if (this.gyroscopeSamples > 0) {
          this.lastgammazero = this.gammazero;
          this.lastbetazero = this.betazero;
    
          if (this.gammazero === null) {
            this.gammazero = event.gamma;
            this.betazero = event.beta;
          } senão {
            this.gammazero = (evento.gamma + this.lastgammazero) / 2;
            this.betazero = (evento.beta + this.lastbetazero) / 2;
          }
    
          this.gyroscopeSamples -= 1;
        }
    
        const totalAngleX = this.settings.gyroscopeMaxAngleX - this.settings.gyroscopeMinAngleX;
        const totalAngleY ​​= this.settings.gyroscopeMaxAngleY ​​- this.settings.gyroscopeMinAngleY;
    
        const grausPerPixelX = totalAngleX / this.width;
        const grausPerPixelY = totalAngleY ​​/ this.height;
    
        const angleX = event.gamma - (this.settings.gyroscopeMinAngleX + this.gammazero);
        const angleY ​​= event.beta - (this.settings.gyroscopeMinAngleY ​​+ this.betazero);
    
        const posX = ânguloX / grausPerPixelX;
        const posY = ânguloY / grausPerPixelY;
    
        if (this.updateCall !== null) {
          cancelAnimationFrame(this.updateCall);
        }
    
        este.evento = {
          clientX: posX + this.left,
          clientY: posY + this.top,
        };
    
        this.updateCall = requestAnimationFrame(this.updateBind);
      }
    
      onMouseEnter() {
        this.updateElementPosition();
        this.element.style.willChange = "transformar";
        this.setTransition();
      }
    
      onMouseMove(evento) {
        if (this.updateCall !== null) {
          cancelAnimationFrame(this.updateCall);
        }
    
        este.evento = evento;
        this.updateCall = requestAnimationFrame(this.updateBind);
      }
    
      onMouseLeave() {
        this.setTransition();
    
        if (this.settings.reset) {
          requestAnimationFrame(this.resetBind);
        }
      }
    
      Redefinir() {
        este.evento = {
          clientX: this.left + this.width / 2,
          clientY: this.top + this.height / 2
        };
    
        if (este.elemento && este.elemento.estilo) {
          this.element.style.transform = `perspective(${this.settings.perspective}px) ` +
            `girarX(0deg) ` +
            `girarY(0deg)` +
            `scale3d(1, 1, 1)`;
        }
    
        this.resetGlare();
      }
    
      resetGlare() {
        if (this.glare) {
          this.glareElement.style.transform = "rotate(180deg) translate(-50%, -50%)";
          this.glareElement.style.opacity = "0";
        }
      }
    
      atualizarPosiçãoInicial() {
        if (this.settings.startX === 0 && this.settings.startY === 0) {
          Retorna;
        }
    
        this.onMouseEnter();
    
        if (this.fullPageListening) {
          este.evento = {
            clientX: (this.settings.startX + this.settings.max) / (2 * this.settings.max) * this.clientWidth,
            clientY: (this.settings.startY + this.settings.max) / (2 * this.settings.max) * this.clientHeight
          };
        } senão {
          este.evento = {
            clientX: this.left + ((this.settings.startX + this.settings.max) / (2 * this.settings.max) * this.width),
            clientY: this.top + ((this.settings.startY + this.settings.max) / (2 * this.settings.max) * this.height)
          };
        }
    
    
        deixe backupScale = this.settings.scale;
        this.settings.scale = 1;
        this.update();
        this.settings.scale = backupScale;
        this.resetGlare();
      }
    
      getValues() {
        seja x, y;
    
        if (this.fullPageListening) {
          x = this.event.clientX / this.clientWidth;
          y = this.event.clientY / this.clientHeight;
        } senão {
          x = (this.event.clientX - this.left) / this.width;
          y = (this.event.clientY - this.top) / this.height;
        }
    
        x = Math.min(Math.max(x, 0), 1);
        y = Math.min(Math.max(y, 0), 1);
    
        let tiltX = (this.reverse * (this.settings.max - x * this.settings.max * 2)).toFixed(2);
        let tiltY = (this.reverse * (y * this.settings.max * 2 - this.settings.max)).toFixed(2);
        let angle = Math.atan2(this.event.clientX - (this.left + this.width / 2), -(this.event.clientY - (this.top + this.height / 2))) * (180 / Math.PI);
    
        Retorna {
          inclinaçãoX: inclinaçãoX,
          tiltY: tiltY,
          porcentagemX: x * 100,
          porcentagemY: y * 100,
          ângulo: ângulo
        };
      }
    
      updateElementPosition() {
        let rect = this.element.getBoundingClientRect();
    
        this.width = this.element.offsetWidth;
        this.height = this.element.offsetHeight;
        this.left = rect.left;
        this.top = rect.top;
      }
    
      atualizar() {
        deixe valores = this.getValues();
    
        this.element.style.transform = "perspective(" + this.settings.perspective + "px) " +
          "rotateX(" + (this.settings.axis === "x" ? 0 : values.tiltY) + "graus) " +
          "rotateY(" + (this.settings.axis === "y" ? 0 : values.tiltX) + "graus) " +
          "scale3d(" + this.settings.scale + ", " + this.settings.scale + ", " + this.settings.scale + ")";
    
        if (this.glare) {
          this.glareElement.style.transform = `rotate(${values.angle}deg) translate(-50%, -50%)`;
          this.glareElement.style.opacity = `${values.percentageY * this.settings["max-glare"] / 100}`;
        }
    
        this.element.dispatchEvent(new CustomEvent("tiltChange", {
          "detalhe": valores
        }));
    
        this.updateCall = null;
      }
    
      /**
       * Acrescenta o elemento de brilho (se brilhoPrerender for igual a falso)
       * e define o estilo padrão
       */
      prepareGlare() {
        // Se a opção pré-renderização estiver habilitada, assumimos que todo html/css está presente para um efeito de brilho ideal.
        if (!this.glarePrerender) {
          // Cria elemento de brilho
          const jsTiltGlare = document.createElement("div");
          jsTiltGlare.classList.add("js-tilt-glare");
    
          const jsTiltGlareInner = document.createElement("div");
          jsTiltGlareInner.classList.add("js-tilt-glare-inner");
    
          jsTiltGlare.appendChild(jsTiltGlareInner);
          this.element.appendChild(jsTiltGlare);
        }
    
        this.glareElementWrapper = this.element.querySelector(".js-tilt-glare");
        this.glareElement = this.element.querySelector(".js-tilt-glare-inner");
    
        if (this.glarePrerender) {
          Retorna;
        }
    
        Object.assign(this.glareElementWrapper.style, {
          "posição": "absoluta",
          "topo": "0",
          "esquerda": "0",
          "largura": "100%",
          "altura": "100%",
          "estouro": "escondido",
          "pointer-events": "nenhum"
        });
    
        Object.assign(this.glareElement.style, {
          "posição": "absoluta",
          "topo": "50%",
          "esquerda": "50%",
          "pointer-events": "nenhum",
          "background-image": `linear-gradient(0deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)`,
          "transform": "girar(180 graus) traduzir(-50%, -50%)",
          "transform-origin": "0% 0%",
          "opacidade": "0",
        });
    
        this.updateGlareSize();
      }
    
      updateGlareSize() {
        if (this.glare) {
          const brilhoSize = (this.element.offsetWidth > this.element.offsetHeight ? this.element.offsetWidth : this.element.offsetHeight) * 2;
    
          Object.assign(this.glareElement.style, {
            "width": `${glareSize}px`,
            "altura": `${glareSize}px`,
          });
        }
      }
    
      atualizarClientSize() {
        this.clientWidth = window.innerWidth
          || document.documentElement.clientWidth
          || document.body.clientWidth;
    
        this.clientHeight = window.innerHeight
          || document.documentElement.clientHeight
          || document.body.clientHeight;
      }
    
      onWindowResize() {
        this.updateGlareSize();
        this.updateClientSize();
      }
    
      setTransição() {
        clearTimeout(this.transitionTimeout);
        this.element.style.transition = this.settings.speed + "ms " + this.settings.easing;
        if (this.glare) this.glareElement.style.transition = `opacity ${this.settings.speed}ms ${this.settings.easing}`;
    
        this.transitionTimeout = setTimeout(() => {
          this.element.style.transition = "";
          if (this.glare) {
            this.glareElement.style.transition = "";
          }
        }, this.settings.speed);
    
      }
    
      /**
       * O método retorna as configurações corrigidas da instância
       * @param {boolean} settings.reverse - inverte a direção da inclinação
       * @param {number} settings.max - rotação de inclinação máxima (graus)
       * @param {startX} settings.startX - a inclinação inicial no eixo X, em graus. Padrão: 0
       * @param {startY} settings.startY - a inclinação inicial no eixo Y, em graus. Padrão: 0
       * @param {number} settings.perspective - Transforma a perspectiva, quanto menor, mais extrema a inclinação fica
       * @param {string} settings.easing - Facilitando na entrada/saída
       * @param {number} settings.scale - 2 = 200%, 1,5 = 150%, etc.
       * @param {number} settings.speed - Velocidade da transição de entrada/saída
       * @param {boolean} settings.transition - Define uma transição na entrada/saída
       * @param {string|null} settings.axis - Qual eixo deve ser desabilitado. Pode ser X ou Y
       * @param {boolean} settings.glare - Qual eixo deve ser desabilitado. Pode ser X ou Y
       * @param {number} settings.max-glare - a opacidade máxima "brilho" (1 = 100%, 0,5 = 50%)
       * @param {boolean} settings.glare-prerender - false = VanillaTilt cria os elementos de brilho para você, caso contrário
       * @param {boolean} settings.full-page-listening - Se true, o efeito de paralaxe ouvirá os eventos de movimento do mouse em todo o documento, não apenas no elemento selecionado
       * @param {string|object} settings.mouse-event-element - Seletor de strings ou link para HTML-element quais serão os eventos de escuta do mouse
       * @param {boolean} settings.reset - false = Se o efeito de inclinação tiver que ser redefinido na saída
       * @param {gyroscope} settings.gyroscope - Ativa a inclinação por eventos de orientação do dispositivo
       * @param {gyroscopeSensitivity} settings.gyroscopeSensitivity - Entre 0 e 1 - O ângulo no qual a posição de inclinação máxima é alcançada. 1 = 90 graus, 0,5 = 45 graus, etc.
       * @param {gyroscopeSamples} settings.gyroscopeSamples - Quantos movimentos do giroscópio para decidir a posição inicial.
       */
      extendSettings(configurações) {
        deixe defaultSettings = {
          reverso: falso,
          máximo: 15,
          startX: 0,
          inícioY: 0,
          perspectiva: 1000,
          easing: "cúbico-bezier(.03,.98,.52,.99)",
          escala: 1,
          velocidade: 300,
          transição: verdadeiro,
          eixo: nulo,
          brilho: falso,
          "brilho máximo": 1,
          "glare-prerender": falso,
          "escuta de página inteira": falso,
          "mouse-event-element": null,
          redefinir: verdadeiro,
          giroscópio: verdade,
          giroscópioMinAngleX: -45,
          giroscópioMaxAngleX: 45,
          giroscópioMinAngleY: -45,
          giroscópioMaxAngleY: 45,
          giroscópio Amostras: 10
        };
    
        let newSettings = {};
        for (propriedade var em defaultSettings) {
          if (propriedade nas configurações) {
            newSettings[propriedade] = configurações[propriedade];
          } else if (this.element.hasAttribute("data-tilt-" + propriedade)) {
            let atributo = this.element.getAttribute("data-tilt-" + propriedade);
            tentar {
              newSettings[propriedade] = JSON.parse(atributo);
            } pegar (e) {
              newSettings[propriedade] = atributo;
            }
    
          } senão {
            newSettings[propriedade] = defaultSettings[propriedade];
          }
        }
    
        retornar novasConfigurações;
      }
    
      static init(elementos, configurações) {
        if (elementos instanceof Node) {
          elementos = [elementos];
        }
    
        if (elementos instanceof NodeList) {
          elementos = [].slice.call(elementos);
        }
    
        if (!(elementos instanceof Array)) {
          Retorna;
        }
    
        element.forEach((elemento) => {
          if (!("vanillaTilt" no elemento)) {
            element.vanillaTilt = new VanillaTilt(elemento, configurações);
          }
        });
      }
    }
    
    if (tipo de documento !== "indefinido") {
      /* expõe a classe à janela */
      window.VanillaTilt = VanillaTilt;
    
      /**
       * Carga automática
       */
      VanillaTilt.init(document.querySelectorAll("[data-tilt]"));
    }
    
    return VanillaTilt;
    
    }());

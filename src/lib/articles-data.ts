export interface Article {
  slug: string;
  title: string;
  subtitle: string;
  category: 'Segurança' | 'Legislação' | 'Dicas para Pais' | 'Para Condutores' | 'Contratos';
  publishedAt: string;
  updatedAt: string;
  readTime: string;
  author: {
    name: string;
    role: string;
  };
  excerpt: string;
  tags: string[];
  content: string;
}

export const ARTICLES: Article[] = [
  {
    slug: 'como-escolher-transporte-escolar-seguro',
    title: 'Como escolher um transporte escolar seguro para seu filho: Guia Completo',
    subtitle: 'Confira o checklist indispensável de vistorias, credenciais, equipamentos de segurança e dicas para contratar com tranquilidade.',
    category: 'Segurança',
    publishedAt: '2026-08-15',
    updatedAt: '2026-09-10',
    readTime: '9 min de leitura',
    author: {
      name: 'Equipe Editorial Alô Tio',
      role: 'Especialistas em Mobilidade e Transporte Escolar',
    },
    excerpt: 'Saiba o que avaliar antes de contratar a van escolar do seu filho. Checklist completo com documentação obrigatória, vistorias, equipamentos do veículo e direitos dos pais.',
    tags: ['transporte escolar seguro', 'van escolar', 'segurança infantil', 'contratar van escolar', 'checklist para pais'],
    content: `A escolha do transporte escolar é uma das decisões mais importantes que as famílias tomam a cada início de ano letivo ou mudança de escola. Colocar a segurança e o bem-estar de uma criança sob a responsabilidade de um terceiro exige cuidado, pesquisa prévia e verificação criteriosa de documentos.

No Brasil, o transporte escolar é uma atividade rigorosamente regulamentada pelo Código de Trânsito Brasileiro (CTB) e supervisionada pelos órgãos municipais de trânsito (como secretarias municipais de transportes ou autarquias como DTP, BHTrans, EPTC e similares). No entanto, a presença de veículos não autorizados ainda representa um risco silencioso em diversas cidades.

Para ajudar você a tomar a decisão correta e garantir a integridade dos seus filhos, elaboramos este guia detalhado com o passo a passo completo para a contratação segura.

---

## 1. Verificação da Autorização e Alvará do Município

O primeiro passo antes de qualquer contratação é conferir se tanto o motorista quanto o veículo possuem autorização válida expedida pelo órgão competente da sua cidade.

- **Alvará de Licença:** O município emite um termo ou autorização de tráfego que comprova que o veículo está cadastrado na frota oficial de transporte escolar.
- **Selo de Vistoria Semestral:** Por lei (Art. 136 do CTB), todo veículo escolar deve passar por inspeção técnica a cada seis meses. Geralmente, essa vistoria é identificada por um adesivo oficial afixado no para-brisa dianteiro com indicação do ano e semestre de validade.
- **Consulta Pública:** Na maioria dos municípios, as secretarias de transporte disponibilizam páginas na internet ou canais telefônicos onde os pais podem digitar a placa do veículo ou o número de cadastro (prefixo) para checar se a situação está regular.

> **Dica de Ouro:** Nunca feche negócio apenas por indicação verbal sem antes ver fisicamente a autorização municipal em dia ou consultar o prefixo no órgão de trânsito local.

---

## 2. Requisitos e Qualificações do Condutor

Quem conduz seu filho precisa atender a exigências legais muito específicas para estar habilitado ao transporte de estudantes:

1. **Carteira Nacional de Habilitação (CNH):** O condutor deve possuir CNH na categoria D ou E, além de constar a observação de que exerce atividade remunerada (EAR).
2. **Curso Especializado:** É obrigatória a conclusão e reciclagem periódica de curso específico para condutor de transporte escolar, homologado pelo Conselho Nacional de Trânsito (CONTRAN).
3. **Certidões Negativas:** O motorista deve apresentar certidão negativa do registro de distribuição criminal relativa aos crimes de homicídio, roubo, estupro e corrupção de menores (Art. 329 do CTB), renovada a cada cinco anos.
4. **Idade Mínima:** Ter idade igual ou superior a 21 anos.
5. **Histórico de Infrações:** Não ter cometido nenhuma infração gravíssima nos últimos 12 meses.

Converse abertamente com o condutor, pergunte há quanto tempo atua naquela rota e observe a atenção e cordialidade com que responde às suas dúvidas.

---

## 3. Itens Obrigatórios de Segurança no Veículo

Ao visitar a van ou o micro-ônibus escolar, faça uma checagem minuciosa dos seguintes itens:

- **Cintos de Segurança Individuais:** Deve haver um cinto de segurança em perfeitas condições para cada assento. O número de passageiros nunca pode ultrapassar a lotação máxima registrada no documento do veículo.
- **Tacógrafo (Registrador de Velocidade):** Dispositivo obrigatório que registra a velocidade praticada e os tempos de parada. O disco ou fita do tacógrafo deve estar em funcionamento regular com aferição em dia pelo INMETRO.
- **Faixa Amarela Padronizada:** Pintura ou adesivagem de faixa horizontal amarela na meia altura das laterais e traseira, com largura de 40 cm e os dizeres "ESCOLAR" em letras pretas (ou faixa preta com letras amarelas se a van for amarela).
- **Luzes Superiores:** Lanternas de luz branca, fosca ou amarela na parte dianteira superior e lanternas vermelhas na traseira superior.
- **Extintor de Incêndio:** Em conformidade com as normas vigentes de trânsito, com carga e dentro do prazo de validade.
- **Janelas com Travas de Segurança:** As aberturas dos vidros não devem permitir que a criança coloque a cabeça ou o corpo para fora (abertura máxima recomendada de 10 cm).

---

## 4. O Papel do Acompanhante / Monitor Escolar

Em muitos municípios, a legislação exige a presença de um(a) monitor(a) ou assistente de bordo para veículos que transportam crianças da Educação Infantil (geralmente menores de 7 anos). Mesmo onde não é obrigatório por lei, a presença do monitor é um grande diferencial de segurança:

- Ajuda no embarque e desembarque, garantindo que a criança desça sempre pelo lado da calçada.
- Assegura que todas as crianças permaneçam com o cinto de segurança afivelado durante todo o trajeto.
- Evita distrações do motorista com o comportamento das crianças na parte traseira, permitindo foco total na direção defensiva.
- Entrega a criança em mãos para o responsável ou profissional da escola credenciado.

---

## 5. Itinerário e Tempo Máximo de Percurso

Um erro comum é contratar o transporte sem avaliar a posição da sua residência na rota do motorista. 

- **Tempo Máximo Recomendado:** Especialistas em desenvolvimento infantil recomendam que a criança não fique mais do que 40 a 60 minutos dentro do veículo em cada viagem.
- **Ordem de Recolhimento:** Pergunte quem é o primeiro e o último aluno a ser pego e entregue. Uma criança que acorda às 5h30 para uma aula que começa às 7h30 terá seu rendimento e disposição prejudicados ao longo do ano.
- **Paradas Seguras:** Certifique-se de que o motorista para em locais seguros e não comete infrações como fila dupla em frente à escola.

---

## Checklist Rápido para os Pais

Antes de assinar o contrato, marque mentalmente ou no papel:

- [ ] Motorista possui CNH categoria D/E com observação de transporte escolar?
- [ ] Vistoria municipal está válida (selo no para-brisa conferido)?
- [ ] O veículo possui um cinto de segurança individual para cada lugar?
- [ ] Há tacógrafo com certificado de calibração do Inmetro?
- [ ] A van possui faixa escolar regulamentada de 40 cm?
- [ ] Há monitor(a) acompanhante para crianças pequenas?
- [ ] O tempo total de percurso é compatível com a rotina do seu filho?
- [ ] As referências com outros pais ou com a coordenação da escola foram favoráveis?
- [ ] Foi formalizado um contrato de prestação de serviços com regras claras?

Contratar com atenção e critério é a melhor forma de garantir a segurança dos pequenos e o sono tranquilo dos pais todos os dias letivos.`
  },
  {
    slug: 'legislacao-transporte-escolar-ctb',
    title: 'Legislação do Transporte Escolar no Brasil: O que diz o CTB e as Prefeituras',
    subtitle: 'Entenda os artigos 136 a 139 do Código de Trânsito Brasileiro e as regras municipais para a condução de estudantes.',
    category: 'Legislação',
    publishedAt: '2026-08-20',
    updatedAt: '2026-09-08',
    readTime: '8 min de leitura',
    author: {
      name: 'Equipe Editorial Alô Tio',
      role: 'Especialistas em Legislação de Trânsito',
    },
    excerpt: 'Conheça em detalhes o que a lei brasileira exige dos veículos e condutores de transporte escolar. Normas do CTB, vistorias obrigatórias e penalidades para irregulares.',
    tags: ['legislação trânsito', 'CTB transporte escolar', 'artigo 136 CTB', 'regras van escolar', 'detran escolar'],
    content: `O transporte de estudantes no Brasil é regido principalmente pela Lei Federal nº 9.503/1997, o Código de Trânsito Brasileiro (CTB), especificamente em seu Capítulo XIII (Artigos 136 a 139), complementado por Resoluções do Conselho Nacional de Trânsito (CONTRAN) e legislações municipais próprias.

O objetivo do legislador ao criar um capítulo exclusivo para a condução coletiva de escolares foi blindar as crianças e adolescentes contra a negligência mecânica e condutores desqualificados. 

A seguir, dissecamos o que cada artigo da lei estabelece e quais são as obrigações legais de quem presta esse serviço.

---

## O Veículo: Exigências do Artigo 136 do CTB

De acordo com o Artigo 136 do CTB, os veículos especialmente destinados à condução coletiva de escolares somente poderão circular nas vias públicas com autorização emitida pelo órgão ou entidade executiva de trânsito dos Estados e do Distrito Federal (DETRAN), devendo cumprir os seguintes requisitos:

1. **Registro como Veículo de Aluguel:** O veículo precisa ser registrado na categoria aluguel, caracterizado pelas tradicionais placas vermelhas ou pelas placas padrão Mercosul com caracteres vermelhos sobre fundo branco.
2. **Pintura de Faixa Horizontal:** Pintura de faixa horizontal amarela na meia altura da carroceria, com 40 centímetros de largura, contendo a palavra "ESCOLAR" grafada em preto. Se o veículo tiver a carroceria originalmente amarela, a faixa deverá ser preta com a inscrição em amarelo.
3. **Inspeção Semestral Obrigatória:** Realização semestral de vistoria para verificação dos equipamentos de segurança e de freios, suspensão e sistemas mecânicos.
4. **Tacógrafo (Registrador Inalterável de Velocidade):** Equipamento registrador instantâneo inalterável de velocidade e tempo, aferido e lacrado periodicamente por técnicos credenciados pelo INMETRO.
5. **Lanternas de Identificação Escolar:** Lanternas de luz branca, fosca ou amarela dispostas nas extremidades da parte superior dianteira e lanternas de luz vermelha na extremidade da parte superior traseira.
6. **Cintos de Segurança em Número Igual à Lotação:** É expressamente proibido o transporte de escolares em pé ou sem cinto. O número de cintos de segurança deve corresponder exatamente ao número de passageiros autorizados.

---

## O Condutor: Exigências do Artigo 138 do CTB

Nem todo motorista habilitado pode conduzir transporte escolar. O Artigo 138 impõe barreiras rigorosas de qualificação pessoal e profissional:

- **Idade Mínima:** Ter idade igual ou superior a 21 anos.
- **Habilitação Categoria D:** O profissional deve estar habilitado, no mínimo, na categoria D (que permite a condução de passageiros com mais de 8 lugares além do condutor).
- **Sem Infrações Graves Recentes:** Não ter cometido nenhuma infração gravíssima nos últimos doze meses.
- **Curso de Formação Especializada:** Ser aprovado em curso específico para condutores de veículos de transporte escolar, ministrado por instituições credenciadas pelo DETRAN, com carga horária e matriz curricular definidas pelo CONTRAN, com atualização periódica a cada cinco anos.
- **Certidão Negativa de Antecedentes Criminais:** Conforme o Artigo 329 do CTB, é indispensável a apresentação de certidão negativa criminal pelos crimes de homicídio, roubo, estupro e corrupção de menores.

---

## A Competência Municipal

Enquanto o CTB define os parâmetros nacionais mínimos de segurança do veículo e do motorista, a Constituição Federal (Art. 30, V) atribui aos **Municípios** a competência para organizar e prestar os serviços de transporte de interesse local.

Por essa razão, a maioria das cidades brasileiras edita Leis Municipais ou Decretos que regulamentam:
- A idade máxima permitida para a van ou micro-ônibus (geralmente entre 10 e 15 anos de fabricação).
- O cadastramento de monitores escolares no veículo.
- Os pontos e bolsões de parada permitidos em frente às escolas públicas e particulares.
- O alvará anual de funcionamento e a tabela de taxas municipais.

---

## Consequências e Penalidades para o Transporte Clandestino

Conduzir veículo escolar sem a autorização exigida pelo Artigo 136 constitui infração gravíssima (Artigo 231, VIII do CTB e atualizações da Lei 13.855/2019):

- **Multa Gravíssima multiplicada.**
- **Remoção do Veículo ao Pátio:** O veículo é apreendido imediatamente.
- **Responsabilidade Civil e Criminal:** Em caso de acidente ou incidente com passageiros a bordo, o condutor clandestino responde civilmente por todos os danos e criminalmente por expor a vida ou a saúde de terceiros a perigo direto e iminente (Art. 132 do Código Penal).

Conhecer a legislação é o primeiro passo para exigir dos prestadores de serviço aquilo que a lei garante: o transporte seguro, responsável e digno para todas as crianças.`
  },
  {
    slug: 'contrato-transporte-escolar-cuidados',
    title: 'Contrato de Transporte Escolar: Direitos dos Pais, Deveres e Cuidados Essenciais',
    subtitle: 'Veja quais cláusulas são indispensáveis, como funciona a cobrança nas férias escolares e o que o Código de Defesa do Consumidor diz sobre multas.',
    category: 'Contratos',
    publishedAt: '2026-08-25',
    updatedAt: '2026-09-05',
    readTime: '8 min de leitura',
    author: {
      name: 'Equipe Editorial Alô Tio',
      role: 'Especialistas em Direitos do Consumidor',
    },
    excerpt: 'Tudo o que pais e transportadores precisam saber sobre o contrato de van escolar: pagamento nas férias, cancelamento, quebra do veículo e direitos do consumidor.',
    tags: ['contrato van escolar', 'férias escolares pagamento', 'procon transporte escolar', 'direitos do consumidor', 'mensalidade van'],
    content: `A contratação do transporte escolar é uma relação jurídica de prestação de serviços enquadrada perfeitamente no Código de Defesa do Consumidor (Lei Federal nº 8.078/1990). Isso significa que os pais são consumidores e o transportador escolar (seja ele autônomo, MEI ou pessoa jurídica) é o fornecedor do serviço.

Apesar da relação de confiança e proximidade que comumente se estabelece entre as famílias e o "tio da van", a formalização de um contrato por escrito é fundamental para proteger ambas as partes, evitando desentendimentos futuros sobre valores, horários, férias e cancelamentos.

---

## 1. Cláusulas Indispensáveis no Contrato

Todo contrato de transporte escolar deve conter, com clareza e precisão:

- **Qualificação das Partes:** Nome completo, RG, CPF/CNPJ, endereço residencial/comercial e telefone tanto do contratante quanto do prestador de serviço.
- **Dados do Veículo:** Modelo, ano, placa e número do alvará municipal ou prefixo de autorização.
- **Itinerário e Horários:** Endereço exato de recolhimento da criança, endereço da escola de destino, turno (manhã ou tarde) e tolerância máxima de atraso pactuada para ambas as partes.
- **Preço e Forma de Pagamento:** Valor da mensalidade, data fixa de vencimento, modalidade de quitação (boleto, Pix ou transferência) e índice de reajuste anual.
- **Substituição em Caso de Pane:** Como será feito o transporte da criança se o veículo principal apresentar defeito mecânico ou estiver em manutenção.

---

## 2. A Cobrança nos Meses de Férias (Julho e Janeiro)

Uma das maiores fontes de dúvidas entre as famílias é a cobrança das mensalidades nos períodos de recesso escolar (julho) e férias de fim de ano (dezembro e janeiro).

### O que o PROCON e a Justiça estabelecem?
A cobrança durante as férias **é legal**, desde que esteja claramente prevista no contrato inicial e que corresponda ao plano anual de pagamento.

O custo da prestação do serviço de transporte escolar é calculado anualmente (incluindo seguro, impostos, amortização do veículo, manutenção preventiva e remuneração do profissional ao longo dos 12 meses). O prestador tem duas formas transparentes de cobrar esse valor:
1. **Em 10 parcelas:** Cobrança apenas de fevereiro a novembro (com parcelas de valor mensal maior).
2. **Em 12 parcelas iguais:** Diluição do custo anual de janeiro a dezembro (com parcelas mensais menores, inclusive nos meses de férias).

> **Atenção:** O que o transportador **não pode** fazer é cobrar as férias de forma surpresa ou impor uma cobrança extra sem que o contrato tenha estipulado previamente o número de parcelas que compõem a anuidade do serviço.

---

## 3. O que Acontece Quando a Van Quebra?

Falhas mecânicas imprevistas podem ocorrer com qualquer veículo. No entanto, a obrigação de garantir o transporte da criança continua existindo:

- O transportador deve providenciar um veículo substituto que atenda aos mesmos requisitos legais de segurança e conforto (van regularizada com cinto para todos).
- Caso o transportador não consiga providenciar outro veículo e os pais precisem arcar com táxi, aplicativo ou outro meio para levar e buscar o filho, o valor despendido deve ser reembolsado pelo prestador ou abatido na mensalidade seguinte mediante apresentação de recibo.

---

## 4. Faltas do Aluno e Cancelamento do Serviço

- **Faltas por Motivo Pessoal ou Saúde:** Se a criança adoecer ou faltar às aulas por qualquer motivo exclusivo da família, o transportador continua tendo o direito de receber a mensalidade integral. O veículo esteve disponível, a vaga foi reservada na rota e o trajeto continuou sendo percorrido.
- **Cancelamento e Multa Rescisória:** Se a família mudar de bairro ou de escola e precisar cancelar o contrato antes do término do ano letivo, o contrato pode prever multa rescisória. Contudo, essa multa **não pode ser abusiva**. O PROCON considera desproporcionais e nulas multas superiores a 10% ou 20% do valor restante das parcelas até o final do ano.

---

## Dica Final: Guarde Sempre uma Via Assinada

Nunca assine contratos em branco ou concorde com cláusulas verbais que alterem o que está escrito. Mantenha uma via física ou digitalizada assinada por ambas as partes e solicite recibos ou comprovantes a cada mensalidade paga. Essa organização garante a tranquilidade de todos e mantém o foco no que realmente importa: o trajeto seguro e feliz das crianças.`
  },
  {
    slug: 'transporte-escolar-legalizado-vs-clandestino',
    title: 'Transporte Escolar Legalizado vs. Clandestino: Os Riscos Invisíveis para as Crianças',
    subtitle: 'Por que o transporte irregular cobra menos e quais perigos ele esconde por trás do preço baixo.',
    category: 'Segurança',
    publishedAt: '2026-08-30',
    updatedAt: '2026-09-02',
    readTime: '7 min de leitura',
    author: {
      name: 'Equipe Editorial Alô Tio',
      role: 'Especialistas em Trânsito e Mobilidade',
    },
    excerpt: 'Entenda a diferença real entre o transporte escolar legalizado e o clandestino. Riscos de acidentes, falta de seguro para passageiros e como denunciar vans irregulares.',
    tags: ['transporte clandestino', 'van clandestina', 'segurança escolar', 'perigo transporte irregular', 'fiscalização detran'],
    content: `Em muitas cidades e portas de colégios, pais se deparam com ofertas de transporte escolar com mensalidades significativamente inferiores às cobradas pela média do mercado. À primeira vista, a economia mensal pode parecer tentadora no orçamento doméstico. Mas você já parou para pensar em como o transporte clandestino consegue cobrar tão pouco?

A resposta é alarmante: o desconto no preço é obtido abrindo mão diretamente da segurança, das vistorias técnicas, do seguro dos passageiros e da checagem de antecedentes. 

Neste artigo, explicamos em detalhes os perigos invisíveis a que as famílias expõem seus filhos ao contratar um transporte irregular.

---

## 1. A Ausência de Vistoria Mecânica Obrigatória

Um veículo escolar regularizado é obrigado por lei federal a passar por **duas vistorias minuciosas por ano** nos postos credenciados pelo DETRAN e pelas prefeituras. Nessas inspeções são checados:
- Estado real do sistema de freios, discos e pastilhas.
- Integridade da suspensão, pivôs, terminais de direção e amortecedores.
- Estado dos pneus (proibição de pneus carecas ou remoldados em eixo dianteiro).
- Funcionamento do registrador inalterável de velocidade (tacógrafo).
- Fixação dos bancos e integridade dos cintos de segurança.

Os veículos clandestinos nunca passam por essas vistorias. Muitas vezes são vans com mais de 20 anos de uso, com manutenções precárias, que rodam até o limite da quebra mecânica, aumentando exponencialmente o risco de capotamentos e colisões graves.

---

## 2. A Inexistência de Seguro contra Acidentes a Passageiros (APP)

Para obter e renovar a licença de transporte escolar, o profissional legalizado é obrigado a contratar uma apólice de **Seguro de Acidentes Pessoais a Passageiros (APP)**. 

Esse seguro cobre:
- Despesas médicas e hospitalares de emergência em caso de acidente.
- Indenizações por invalidez temporária ou permanente.
- Amparo financeiro imediato aos familiares sem necessidade de disputas judiciais desgastantes.

No transporte clandestino, **não existe qualquer seguro de passageiros**. Se a van irregular se envolver em um acidente grave, o motorista muitas vezes não tem patrimônio para arcar com os tratamentos médicos necessários, deixando a família da criança completamente desamparada no momento mais crítico.

---

## 3. Quem Está Dirigindo? Falta de Checagem de Antecedentes

O condutor legalizado precisa comprovar idoneidade moral e ausência de antecedentes criminais específicos a cada renovação, além de passar por curso de direção defensiva e atendimento a emergências de saúde infantil.

No transporte clandestino:
- Não há qualquer garantia sobre o histórico do motorista ou de quem ele coloca dentro do veículo para ajudar.
- O motorista pode ter a CNH suspensa ou cassada por excesso de pontos ou infrações de embriaguez ao volante.
- Não há controle sobre lotação: crianças frequentemente são transportadas espremidas em número muito superior ao permitido, sentadas umas sobre as outras ou em banquetas improvisadas sem qualquer cinto de segurança.

---

## 4. O Constrangimento e Risco de Apreensão com Crianças a Bordo

As operações de fiscalização de trânsito (Polícia Militar, Guarda Municipal e órgãos de trânsito) são constantes nas imediações de colégios. 

Quando uma van clandestina é interceptada em blitz:
- O veículo é imediatamente autuado e removido por guincho ao depósito público.
- As crianças passam pelo trauma e constrangimento de presenciar a abordagem policial, ficando retidas até que os pais sejam localizados para buscá-las no local da blitz ou em postos policiais.
- O condutor irregular responde administrativamente e penalmente.

---

## Quadro Comparativo: Legalizado vs. Clandestino

| Critério | Transporte Legalizado | Transporte Clandestino |
| :--- | :--- | :--- |
| **Vistoria Técnica** | Semestral obrigatória em órgãos credenciados | Nenhuma fiscalização mecânica |
| **Seguro de Passageiros (APP)** | Apólice ativa obrigatória | Inexistente |
| **Antecedentes Criminais** | Certidões negativas periódicas exigidas | Sem checagem |
| **Equipamentos de Segurança** | Cintos para todos, tacógrafo lacrado, extintor | Frequente superlotação e sem cintos |
| **Identificação Visual** | Faixa de 40 cm "ESCOLAR" e número do alvará | Descaracterizado ou com adesivos falsos |
| **Embarque e Desembarque** | Locais autorizados pela prefeitura | Paradas irregulares com risco de atropelamento |

A vida e a segurança dos seus filhos não têm preço. O valor ligeiramente menor da mensalidade nunca compensará o risco incalculável de um acidente sem amparo ou de um trajeto sem segurança.`
  },
  {
    slug: 'dicas-para-condutores-de-van-escolar',
    title: 'Guia para Condutores Escolares: Gestão de Rotas, Manutenção e Confiança das Famílias',
    subtitle: 'Boas práticas para profissionais de transporte escolar: como fidelizar clientes, reduzir custos com combustível e dirigir com excelência.',
    category: 'Para Condutores',
    publishedAt: '2026-09-01',
    updatedAt: '2026-09-09',
    readTime: '8 min de leitura',
    author: {
      name: 'Equipe Editorial Alô Tio',
      role: 'Especialistas em Gestão de Frotas e Transporte',
    },
    excerpt: 'Dicas práticas para motoristas de transporte escolar melhorarem a gestão do seu negócio: planejamento de rotas, manutenção preventiva, pontualidade e relacionamento com os pais.',
    tags: ['dicas motorista van', 'gestão transporte escolar', 'manutenção van escolar', 'rotas van escolar', 'atendimento aos pais'],
    content: `A profissão de condutor escolar — carinhosamente chamado de "Tio" ou "Tia" da van — é uma das mais nobres e de maior responsabilidade no trânsito urbano. Mais do que transportar passageiros do ponto A ao ponto B, o profissional cuida diariamente do bem mais precioso de dezenas de famílias.

Com o aumento dos custos operacionais (combustível, pneus, manutenção e licenciamentos), o transportador que deseja manter sua van cheia e ter um negócio sustentável e lucrativo precisa aliar direção segura a uma boa gestão financeira e de relacionamento.

Neste guia, reunimos as melhores práticas recomendadas por condutores experientes para transformar o seu serviço em referência na sua cidade.

---

## 1. Planejamento Inteligente de Rotas

O combustível e o desgaste mecânico representam as maiores fatias dos custos de uma van escolar. Uma rota mal planejada queima dinheiro e estressa as crianças com tempos excessivos no trânsito.

- **Agrupamento Geográfico Rigoroso:** Ao montar a turma do ano letivo, priorize alunos que residam no mesmo quadrante ou corredor viário. É preferível recusar um aluno muito distante da sua área natural de atendimento do que alongar o percurso de todos os outros em 30 minutos.
- **Teste de Horários Reais:** Antes do primeiro dia de aula, percorra a rota exatamente nos horários de pico em que você irá circular. O trânsito das 6h45 pode ser completamente diferente do trânsito das 7h15.
- **Rotas Alternativas Mapeadas:** Tenha sempre rotas de escape previamente estudadas para desviar de alagamentos, obras ou acidentes comuns nas vias arteriais da sua cidade.

---

## 2. Manutenção Preventiva: A Regra de Ouro da Economia

Esperar uma peça quebrar para consertar é a maneira mais cara e perigosa de gerenciar um veículo escolar. Além do prejuízo financeiro com reboque e diárias de oficina, a van parada causa transtorno imediato a dezenas de clientes.

- **Checklist Diário Matinal:**
  - Conferir a pressão dos pneus (sempre a frio) e inspecionar o estepe.
  - Checar o nível de óleo do motor e líquido de arrefecimento.
  - Testar todas as luzes: faróis, setas, luz de freio e lanternas superiores escolares.
  - Verificar a integridade e travamento de todos os fechos de cintos de segurança.
- **Revisão Periódica Programada:** Siga rigorosamente o manual do fabricante para troca de fluidos de freio, filtros de combustível, pastilhas, correia dentada e suspensão. Um motor bem regulado consome até 15% menos diesel ou gasolina.
- **Higienização Constante:** Mantenha o interior da van limpo, aspirado e bem ventilado. Um ambiente agradável causa uma impressão excelente nos pais nas primeiras semanas de aula.

---

## 3. Comunicação Transparente com os Pais

A pontualidade e a comunicação são os fatores que mais geram confiança e retenção de contratos ano após ano.

- **Canal de Avisos no WhatsApp:** Crie uma lista de transmissão ou grupo somente com permissão de administradores enviarem mensagens para avisar imprevistos.
- **Transparência em Caso de Atrasos:** Se houver um congestionamento anormal decorrente de acidente, envie um aviso breve aos pais com previsão de horário. O que gera ansiedade nas famílias não são 10 minutos de atraso, mas a falta de informação.
- **Trato Afetuoso e Respeitoso:** Conheça o nome de cada criança, seus hábitos e preferências. Crianças que se sentem felizes e acolhidas na van são as maiores promotoras do seu trabalho para novos pais.

---

## 4. Gestão Financeira e Formalização

Tratar o transporte escolar como uma empresa profissional protege seu patrimônio pessoal e abre portas:

- **Formalização como MEI:** O transportador escolar pode se cadastrar como Microempreendedor Individual (MEI - CNAE de transporte escolar), garantindo cobertura previdenciária (aposentadoria, auxílio-doença) e facilidade na emissão de notas fiscais para famílias que solicitam comprovação no Imposto de Renda.
- **Contratos Claros:** Sempre firme contratos com regras de vencimento, formas de cobrança nas férias e política de cancelamento. Isso elimina o estresse de inadimplência e estabelece profissionalismo desde o primeiro contato.

Ao manter seu veículo impecável, suas autorizações em dia e um relacionamento transparente com as famílias, sua vaga no transporte escolar se tornará concorrida e sua reputação crescerá organicamente por indicação.`
  },
  {
    slug: 'direitos-dos-pais-no-transporte-escolar',
    title: 'Direitos do Consumidor no Transporte Escolar: Dúvidas Mais Frequentes',
    subtitle: 'O que o PROCON diz sobre pagamentos em feriados, rescisão de contrato, reajustes e cancelamento unilateral.',
    category: 'Dicas para Pais',
    publishedAt: '2026-09-03',
    updatedAt: '2026-09-11',
    readTime: '7 min de leitura',
    author: {
      name: 'Equipe Editorial Alô Tio',
      role: 'Consultoria Jurídica e Direitos do Consumidor',
    },
    excerpt: 'Tire suas dúvidas sobre os direitos dos pais na contratação do transporte escolar: Procon, cancelamento, reajuste de mensalidades e responsabilidades do condutor.',
    tags: ['direitos dos pais', 'procon van escolar', 'dúvidas transporte escolar', 'reajuste mensalidade van', 'código defesa consumidor'],
    content: `A contratação do transporte escolar envolve questões financeiras e contratuais que costumam gerar atritos entre contratantes e prestadores de serviço quando as regras não são previamente compreendidas.

Com o objetivo de esclarecer dúvidas recorrentes de pais e responsáveis, reunimos as respostas fundamentadas nas orientações dos órgãos de proteção ao consumidor (PROCON) e no Código de Defesa do Consumidor (CDC).

---

## 1. O motorista pode recusar pegar a criança na porta de casa?

Em regra, o transporte escolar convencional opera no sistema "porta a porta", recolhendo a criança na residência informada no contrato e deixando-a na escola.

Entretanto, há exceções legítimas:
- Se a rua da residência for de difícil acesso geométrico para o porte da van (vias muito estreitas, sem saída, ladeiras perigosas com risco de tombamento ou sem área de manobra).
- Em condomínios fechados onde a administração interna proíbe a circulação de veículos de grande porte, combinando-se o embarque na portaria principal.

Nesses casos excepcionais, o ponto de encontro deve ser expressamente acordado e delimitado no contrato de prestação de serviços para que ambas as partes concordem antes do início do ano letivo.

---

## 2. A criança adoeceu e faltou duas semanas. Tenho direito a desconto?

**Não.** Se a interrupção no comparecimento do aluno decorrer de motivo pessoal, doença ou viagem familiar, o valor da mensalidade deve ser pago integralmente.

Isso ocorre porque o transporte escolar não cobra por quilômetro rodado individualmente, mas sim pela disponibilização contínua da vaga na rota. Enquanto o aluno esteve ausente, o motorista manteve o assento reservado (não podendo preenchê-lo com outro estudante) e continuou tendo os mesmos custos fixos para percorrer o itinerário.

---

## 3. O transportador pode mudar o horário de passagem sem avisar?

**Não.** Alterações significativas no itinerário ou no horário fixado em contrato devem ser comunicadas com antecedência razoável aos responsáveis.

Atrasos pontuais ocasionados por intempéries climáticas ou acidentes de trânsito imprevisíveis são toleráveis dentro de uma margem razoável, mas a alteração sistemática de horários sem prévio consentimento pode configurar falha na prestação do serviço, permitindo a rescisão do contrato sem cobrança de multa para a família.

---

## 4. O contrato pode prever reajuste no meio do ano?

Em contratos com duração de um ano, o valor das mensalidades deve ser mantido fixo durante todo o período contratado, não sendo permitidos reajustes semestrais ou aleatórios sem previsão legal (Art. 2º da Lei Federal nº 10.192/2001).

O reajuste da anuidade só deve ocorrer ao término do período de 12 meses ou na renovação para o ano letivo seguinte, com base em índices oficiais de inflação (como IPCA ou INPC) ou aumentos devidamente justificados de custos operacionais pactuados em contrato.

---

## 5. Como agir se o serviço não estiver sendo prestado adequadamente?

Se o veículo estiver constantemente atrasado, apresentar problemas mecânicos repetitivos, transportar crianças sem cinto de segurança ou infringir regras municipais, a família deve:
1. **Registrar a reclamação formalmente:** Por mensagem escrita ou e-mail com o transportador, dando prazo para adequação.
2. **Rescindir com justa causa:** Se a falha persistir, o contrato pode ser rompido imediatamente sem o pagamento de multa rescisória, com base no Artigo 20 do Código de Defesa do Consumidor.
3. **Acionar os órgãos competentes:** Notificar o PROCON municipal para mediação de valores e comunicar o órgão de fiscalização de trânsito caso haja risco à segurança das crianças.

A relação entre família e condutor deve ser sempre pautada pelo diálogo respeitoso e pela priorização absoluta da segurança física e emocional dos pequenos passageiros.`
  }
];

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function getAllArticleSlugs(): string[] {
  return ARTICLES.map((a) => a.slug);
}

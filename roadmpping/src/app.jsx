import * as React from "react";
import { createRoot } from "react-dom/client";

import "../src/assets/style.css";

//ml = machine learning
// isso vai vir da base no futuro
const ml_data = [
    {
        text: "A pesquisa global Indústria 4.0 reúne a opinião de mais de 2 mil participantes dos nove maiores setores industriais em 26 países.",
        ml_category: "Market",
    },
    {
        text: "Atualmente, apenas 9% das empresas brasileiras se classificam como avançadas em níveis de digitização, mas em 2020 esse percentual deve saltar para 72%.",
        ml_category: "Market",
    },
    {
        text: "No fim desse processo de transformação, as empresas bem-sucedidas se tornarão verdadeiramente digitais, com produtos físicos em seu núcleo, potencializados por interfaces digitais e serviços inovadores baseados em dados.",
        ml_category: "Technology",
    },
    {
        text: "A maior parte das empresas brasileiras concorda que, ao longo dos próximos cinco anos, os ganhos nessas três frentes serão maiores que 10% de sua receita.",
        ml_category: "Market",
    },
    {
        text: "Com alto investimento em tecnologia e treinamento, elas veem a sua transformação digital principalmente em termos de ganhos de eficiência operacional, redução de custos e garantia de qualidade.",
        ml_category: "Product",
    },
    {
        text: "As empresas brasileiras não fazem grandes investimentos atualmente _x0096_ apenas 10% delas investem mais de 8% de sua receita.",
        ml_category: "Market",
    },
    {
        text: "Certifique-se de que a liderança da empresa está pronta e disposta a defender a sua abordagem.",
        ml_category: "Market",
    },
    {
        text: "O _x0093_tom_x0094_ deve ser definido pelo topo, com liderança clara, comprometimento e visão dos executivos e stakeholders financeiros.",
        ml_category: "Technology",
    },
    {
        text: "Desenvolva produtos e serviços completos para seus clientes.",
        ml_category: "Technology",
    },
    {
        text: "A indústria 4.0 significa uma grande revolução para as empresas que compreendem inteiramente o que ela representa para a maneira como elas fazem negócios.",
        ml_category: "Market",
    },
];
// isso vai vir da base no futuro
const uniqueCategories = [...new Set(ml_data.map(item => item.ml_category))];


let tagIds = {} // object -> {tagName:tagID, tagName2: tagID2, ...} (pra um item poder ter mais de uma tag vai ter q mudar essa estrutura)

const uploadTags = async () => {
    const colors = ['red', 'yellow', 'green'] // para ter mais de 3 tags o ideal seria acrescentar cores nesse array
    for (let i = 0; i < uniqueCategories.length; i++) {
        const tagTitle = uniqueCategories[i]
        if (!(tagTitle in tagIds)) {
            const tag = await miro.board.createTag({
                title: tagTitle,
                color: colors[i],
            });
            tagIds[tag.title] = tag.id
        }
    }
}

const uploadNotes = async () => {
    const position = {
        x: 0,
        y: 0,
        width: 200,
        height: 200
    }

    for (const item of ml_data) {
        // essa find empty space nao funcionou dentro do foreach, talvez seja rapido de mais pra ela
        // const position = await miro.board.findEmptySpace({
        //     x: 0,
        //     y: 0,
        //     width: 200,
        //     height: 200,
        // });

        await miro.board.createStickyNote({
            content: `<p>${item.text}</p>`,
            x: position.x,
            y: position.y,
            shape: "square",
            width: position.width,
            tagIds: [tagIds[item.ml_category]]
        });
        position.x = position.x < 1000 ? position.x + 250 : position.x = 0
        position.y = position.x === 0 ? position.y + 250 : position.y
    }

}



const clickHandler = async () => {
    const tags = await miro.board.get({ type: 'tag' })
    tagIds = tags.reduce((acc, tag) => {
        const { title, id } = tag;
        acc[title] = id;
        return acc;
    }, {});
    console.log(tagIds)

    uploadTags()
    uploadNotes()

};

const App = () => {
    return (
        <div className="grid wrapper">
            <div className="cs1 ce12">
                <img src="/src/assets/congratulations.png" alt="" />
            </div>

            <button
                className="button button-primary button-medium"
                type="button"
                onClick={clickHandler}
            >
                <span className="icon-eye"></span>
                Puxar dados
            </button>
        </div>
    );
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);

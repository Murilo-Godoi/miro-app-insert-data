import * as React from "react";
import { createRoot } from "react-dom/client";
import { useState, useEffect } from "react";

import "../src/assets/style.css";

const App = () => {
    const [jsonData, setJsonData] = useState(null);
    const [columns, setColumns] = useState([]); // colunas do arquivo csv importado
    const [dataColumn, setDataColumn] = useState(""); // coluna que vai ser usada como texto dos post its
    const [labelColumn, setLabelColumn] = useState(""); // coluna que vai ser usada como tag
    const [uniqueCategories, setUniqueCategories] = useState([]); // valores unicos da coluna label
    const [tagIds, setTagIds] = useState({}); // ids das labels dentro do Miro

    // sem o useEffect, ele chama o uploadNotes antes de 
    // terminar o setTagIds (tentei usar await mas só nao funcionou)
    useEffect(() => {
        if (Object.keys(tagIds).length > 0 && jsonData) {
            uploadNotes();
        }
    }, [tagIds, jsonData]);

    const uploadTags = async () => {
        const colors = ['red', 'yellow', 'green']; // para ter mais de 3 tags o ideal seria acrescentar cores nesse array
        const tags = await miro.board.get({ type: 'tag' });
        const tagIdsObject = {};
    
        for (let i = 0; i < uniqueCategories.length; i++) {
            const tagTitle = uniqueCategories[i];
            const existingTag = tags.find(tag => tag.title === tagTitle);
    
            if (!existingTag) {
                const newTag = await miro.board.createTag({
                    title: tagTitle,
                    color: colors[i % colors.length], // se tiver mais de 3 tags n vai dar erro assim
                });
                tagIdsObject[tagTitle] = newTag.id;
            } else {
                tagIdsObject[tagTitle] = existingTag.id;
            }
        }
    
        setTagIds(tagIdsObject);
    };
    
    const uploadNotes = async () => {
        const position = {
            x: 0,
            y: 0,
            width: 200,
            height: 200
        }
    
        for (const item of jsonData) {

            await miro.board.createStickyNote({
                content: `<p>${item[dataColumn]}</p>`,
                x: position.x,
                y: position.y,
                shape: "square",
                width: position.width,
                tagIds: [tagIds[item[labelColumn]]]
            });
            position.x = position.x < 1000 ? position.x + 250 : position.x = 0
            position.y = position.x === 0 ? position.y + 250 : position.y
        }
    
    }
    

    const clickHandler = async () => {
        
        await uploadTags();

    };

    const fileSelectedHandler = (event) => {

        const selectedFile = event.target.files[0]; 
        
        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const csv = event.target.result;
                const jsonData = csvJSON(csv);
                setJsonData(jsonData);
                setColumns(Object.keys(jsonData[0]))
            };
            reader.readAsText(selectedFile);
        }
    };

    function csvJSON(csv) {
        const lines = csv.split("\n");
        const headers = lines[0].split(",");
        const result = [];
    
        for (let i = 1; i < lines.length; i++) {
            const obj = {};
            let currentLine = lines[i].split(",");
            if (currentLine.length > headers.length) {
                // linhas em que um dos itens tem vírgula
                let currentIndex = 0;
                for (let j = 0; j < currentLine.length; j++) {
                    if (currentLine[j].startsWith('"')) {
                        while (!currentLine[j].endsWith('"')) {
                            currentLine[j] += ',' + currentLine[j + 1];
                            currentLine.splice(j + 1, 1);
                        }
                    }
                    obj[headers[currentIndex]] = currentLine[j];
                    currentIndex++;
                }
            } else {
                for (let j = 0; j < headers.length; j++) {
                    obj[headers[j]] = currentLine[j];
                }
            }
            result.push(obj);
        }
    
        return result.slice(0,100);
    }
    

    const handleDataSelectChange = (event) => {
        setDataColumn(event.target.value);
    };

    const handleLabelSelectChange = (event) => {
        const label = event.target.value;
        setLabelColumn(label)
        setUniqueCategories([...new Set(jsonData.map(item => item[label]))])
    };

    return (
        <div className="grid wrapper">
            <div className="cs1 ce12">
                <button
                    className="button button-primary button-medium"
                    type="button"
                    onClick={clickHandler}
                >
                    <span className="icon-eye"></span>
                    Puxar dados
                </button>
            </div>
            
            <div className="form-group cs1 ce12">
                <label htmlFor="example-1">Input label</label>
                <input className="input" type="file" id="example-1" onChange={fileSelectedHandler} accept=".csv"/>
            </div>
            
            {jsonData && (
                <div className="cs1 ce12">
                    <div>
                        <label>Select Data Column:</label>
                        <select value={dataColumn} onChange={handleDataSelectChange}>
                            <option value="">None</option>
                            {columns.map((column, index) => (
                                <option key={index} value={column}>{column}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Select Label Column:</label>
                        <select value={labelColumn} onChange={handleLabelSelectChange}>
                            <option value="">None</option>
                            {columns.map((column, index) => (
                                <option key={index} value={column}>{column}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
            
        </div>
    );
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);

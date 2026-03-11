
const pokeName = document.getElementById('poke-name');
const pokeImg = document.getElementById('poke-img');
const pokeType = document.getElementById('poke-type');
const pokeAbilities = document.getElementById('poke-abilities');
const pokeMoves = document.getElementById('poke-moves');
const evolutionPath = document.getElementById('evolution-path');
const pokeHabitat = document.getElementById('poke-habitat');
const searchInput = document.getElementById('pokemon-search');
const errorMsg = document.getElementById('error-msg');
const favIcon = document.getElementById('fav-icon');


let currentPokemon = null; 
let favorites = [];        


const fetchPokemon = async (nameOrId) => {
    try {
     
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${nameOrId.toLowerCase()}`);
        if (!response.ok) throw new Error("Pokemon not found");
        const data = await response.json();

        const speciesRes = await fetch(data.species.url);
        const speciesData = await speciesRes.json();
       
        const evoRes = await fetch(speciesData.evolution_chain.url);
        const evoData = await evoRes.json();
        
        
        const evoChain = [];
        let curr = evoData.chain;
        while (curr) {
            const pRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${curr.species.name}`);
            const pData = await pRes.json();
            evoChain.push({
                name: curr.species.name,
                sprite: pData.sprites.other['official-artwork'].front_default || pData.sprites.front_default
            });
            curr = curr.evolves_to[0]; 
        }

   
        currentPokemon = {
            id: data.id,
            name: data.name,
            sprite: data.sprites.other['official-artwork'].front_default,
            types: data.types.map(t => t.type.name),
            abilities: data.abilities.map(a => a.ability.name.replace('-', ' ')),
            moves: data.moves.slice(0, 5).map(m => m.move.name.replace('-', ' ')),
            habitat: speciesData.habitat?.name || "unknown",
            evolutionChain: evoChain
        };

        updateUI();
        errorMsg.classList.add('hidden');
    } catch (err) {
        console.error(err);
        errorMsg.classList.remove('hidden');
    }
};


function updateUI() {
    if (!currentPokemon) return;


    pokeName.innerText = currentPokemon.name;
    pokeImg.src = currentPokemon.sprite;
    pokeType.innerText = `Type: ${currentPokemon.types.join(', ')}`;
    pokeHabitat.innerText = `Habitat: ${currentPokemon.habitat}`;

   
    pokeAbilities.innerHTML = currentPokemon.abilities
        .map(a => `<p class="capitalize text-blue-500">${a}</p>`).join('');

  
    pokeMoves.innerHTML = currentPokemon.moves
        .map(m => `<li class="capitalize">${m}</li>`).join('');

    evolutionPath.innerHTML = currentPokemon.evolutionChain
        .map(evo => `
            <div class="evo-card">
                <img src="${evo.sprite}" width="80">
                <p class="capitalize">${evo.name}</p>
            </div>`).join('');


    const isFav = favorites.some(f => f.id === currentPokemon.id);
    favIcon.setAttribute('fill', isFav ? "red" : "none");
}




searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') fetchPokemon(e.target.value);
});


document.getElementById('random-btn').addEventListener('click', () => {
    const randomId = Math.floor(Math.random() * 600 + 1);
    fetchPokemon(randomId.toString());
});


document.getElementById('favorite-btn').addEventListener('click', () => {
    if (!currentPokemon) return;
    
    const index = favorites.findIndex(f => f.id === currentPokemon.id);
    
    if (index > -1) {
        favorites.splice(index, 1);
    } else if (favorites.length < 6) {
        favorites.push(currentPokemon); 
    }
    
    updateLineupVisuals();
    updateUI(); 
});


function updateLineupVisuals() {
    for (let i = 0; i < 6; i++) {
        const slotImg = document.getElementById(`slot-${i}`);
        const slotLabel = slotImg.nextElementSibling;
        
        if (favorites[i]) {
            slotImg.src = favorites[i].sprite;
            slotImg.classList.remove('hidden');
            if (slotLabel) slotLabel.classList.add('hidden');
        } else {
            slotImg.classList.add('hidden');
            if (slotLabel) slotLabel.classList.remove('hidden');
        }
    }
}


fetchPokemon('pikachu');
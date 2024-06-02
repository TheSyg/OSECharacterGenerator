import React, { useEffect } from 'react'
import { PDFDocument } from 'pdf-lib'
import { joinDuplicates } from '../../utilities/utilities'
import download from 'downloadjs'
import {
  CHARACTER_SHEET_PURIST_URL,
  CHARACTER_SHEET_PURIST_DAC_URL,
  CHARACTER_SHEET_UNDERGROUND_URL,
  CHARACTER_STORAGE
} from '../../constants/constants'
import PropTypes from 'prop-types'

export default function PDFExport(props) {
  const {
    character,
    characterStatistics,
    characterClass,
    characterEquipment,
    characterModifiers,
    abilityScores
  } = props

  const characterDataObject = {
    character,
    characterStatistics,
    characterClass,
    characterEquipment,
    characterModifiers,
    abilityScores
  }

  useEffect(() => {
    updateLocalStorage()
  }, [])

  const updateLocalStorage = () => {
    const myCharacters = JSON.parse(
      window.localStorage.getItem(CHARACTER_STORAGE)
    )

    const id = character.id || 0

    if (myCharacters) {
      const alreadyExists = myCharacters.find((obj) => {
        return obj.character.id === id
      })
      if (alreadyExists) {
        return
      }
    }

    if (localStorage.getItem(CHARACTER_STORAGE) === null) {
      const arr = []
      arr.push(characterDataObject)
      window.localStorage.setItem(CHARACTER_STORAGE, JSON.stringify(arr))
    } else {
      myCharacters.push(characterDataObject)
      window.localStorage.setItem(
        CHARACTER_STORAGE,
        JSON.stringify(myCharacters)
      )
    }
  }

  const alignmentCapitalized = character.alignment
    ? character.alignment.charAt(0).toUpperCase() + character.alignment.slice(1)
    : ''

  const languageText = character.hasLanguages
    ? `${alignmentCapitalized}, Common, ${character.languages.join(', ')}`
    : `${alignmentCapitalized}, Common`

  const abilitiesInfo = `
    Weapons: ${joinDuplicates(characterEquipment.weapons).join(', ') || ''}
    Abilities: ${characterClass.abilities.join(', ')}`

  const weaponsInfo = `
    Weapons: ${joinDuplicates(characterEquipment.weapons).join(', ') || ''}
    Armour: ${characterEquipment.armour.join(', ') || ''}
    `

  const equipmentInfo = `
    ${joinDuplicates(characterEquipment.adventuringGear).join(', ') || ''}
    `

  const spellText = character.hasSpells ? `Spells: ${character.spells}` : ''

  const descriptionInfo = `
    ${character.appearance && `Appearance: ${character.appearance}`}
    ${character.background && `Background: ${character.background}`}
    ${character.personality && `Personality: ${character.personality}`}
    ${character.misfortune && `Misfortune: ${character.misfortune}`}
    `

  async function fillForm() {
    const formUrl = CHARACTER_SHEET_PURIST_URL
    const formPdfBytes = await fetch(formUrl).then((res) => res.arrayBuffer())

    const pdfDoc = await PDFDocument.load(formPdfBytes)

    const form = pdfDoc.getForm()

    const formFieldKeysOfficialSheet = {
      // matches the PDF Form labels with correct data

      'Name 2': character.name,
      'Alignment 2': alignmentCapitalized,
      'Character Class 2': characterClass.name,
      'Level 2': '1',
      'STR 2': abilityScores.strength,
      'INT 2': abilityScores.intelligence,
      'DEX 2': abilityScores.dexterity,
      'WIS 2': abilityScores.wisdom,
      'CON 2': abilityScores.constitution,
      'CHA 2': abilityScores.charisma,

      'Death Save 2': characterClass.savingThrows[0],
      'Wands Save 2': characterClass.savingThrows[1],
      'Paralysis Save 2': characterClass.savingThrows[2],
      'Breath Save 2': characterClass.savingThrows[3],
      'Spells Save 2': characterClass.savingThrows[4],

      'Magic Save Mod 2': characterModifiers.wisdomMod,
      'HP 2': characterStatistics.hitPoints,
      'Max HP 2': characterStatistics.hitPoints,
      'AC 2': characterStatistics.armourClass,
      'CON HP Mod 2': characterModifiers.constitutionMod,
      'Unarmoured AC 2': characterStatistics.unarmouredAC,
      'DEX AC Mod 2': characterModifiers.dexterityModAC,
      'STR Melee Mod': characterModifiers.strengthModMelee,
      'DEX Missile Mod': characterModifiers.dexterityModMissiles,
      'Abilities, Skills, Weapons 2': abilitiesInfo,
      'Reactions CHA Mod 2': characterModifiers.charismaModNPCReactions,
      Equipment: equipmentInfo,
      'Weapons and Armour': weaponsInfo,
      GP: characterEquipment.gold,
      Description: descriptionInfo,
      'XP for Next Level': characterClass.nextLevel,
      'PR XP Bonus': characterModifiers.primeReqMod,
      'Attack Bonus': '0',
      Notes: spellText,
      'Languages 2': languageText
    }

    for (const key in formFieldKeysOfficialSheet) {
      let value = formFieldKeysOfficialSheet[key]

      if (value != null) {
        value = value.toString()
      } else {
        value = ''
      }

      form.getTextField(key).setText(value)
    }

    const literacyField = form.getCheckBox('Literacy 2')
    if (abilityScores.intelligence > 8) {
      literacyField.check()
    }

    const pdfBytes = await pdfDoc.save()

    const fileName = `${character.name} the ${characterClass.name}.pdf`

    download(pdfBytes, fileName, 'application/pdf')
  }

  async function fillFormDAC() {
    const formUrl = CHARACTER_SHEET_PURIST_DAC_URL
    const formPdfBytes = await fetch(formUrl).then((res) => res.arrayBuffer())

    const pdfDoc = await PDFDocument.load(formPdfBytes)

    const form = pdfDoc.getForm()

	const fields = form.getFields()
	fields.forEach(field => {
		const type = field.constructor.name
		const name = field.getName()
		console.log(`${type}: ${name}`)
	})

    const formFieldKeysOfficialSheet = {
      // matches the PDF Form labels with correct data

      'Name': character.name,
      'Alignment': alignmentCapitalized,
      'Character Class': characterClass.name,
      'Level': '1',
      'STR': abilityScores.strength,
      'INT': abilityScores.intelligence,
      'DEX': abilityScores.dexterity,
      'WIS': abilityScores.wisdom,
      'CON': abilityScores.constitution,
      'CHA': abilityScores.charisma,

      'Death Save': characterClass.savingThrows[0],
      'Wands Save': characterClass.savingThrows[1],
      'Paralysis Save': characterClass.savingThrows[2],
      'Breath Save': characterClass.savingThrows[3],
      'Spells Save': characterClass.savingThrows[4],

      'Magic Save Mod': characterModifiers.wisdomMod,
      'HP': characterStatistics.hitPoints,
      'Max HP': characterStatistics.hitPoints,
      'AC': 19 - characterStatistics.armourClass,
      'CON HP Mod': characterModifiers.constitutionMod,
      'Unarmoured AC': 19 - characterStatistics.unarmouredAC,
      'DEX AC Mod': characterModifiers.dexterityModAC,
      'STR Melee Mod': characterModifiers.strengthModMelee,
      'Dex Missile Mod': characterModifiers.dexterityModMissiles,
      'Abilities, Skills, Weapons': abilitiesInfo,
      'Reactions CHA Mod': characterModifiers.charismaModNPCReactions,
      Equipment: equipmentInfo,
      'Weapons and Armour': weaponsInfo,
      GP: characterEquipment.gold,
      // Description: descriptionInfo,
      'XP for Next Level': characterClass.nextLevel,
      'PR XP Bonus': characterModifiers.primeReqMod,
 	  'THAC9': '10',
 	  'THAC8': '11',
 	  'THAC7': '12',
 	  'THAC6': '13',
 	  'THAC5': '14',
 	  'THAC4': '15',
 	  'THAC3': '16',
 	  'THAC2': '17',
 	  'THAC1': '18',
 	  'THAC0': '19',
      Notes: spellText,
      'Languages': languageText
    }

    for (const key in formFieldKeysOfficialSheet) {
      let value = formFieldKeysOfficialSheet[key]

      if (value != null) {
        value = value.toString()
      } else {
        value = ''
      }

      form.getTextField(key).setText(value)
    }

    const literacyField = form.getCheckBox('Literacy')
    if (abilityScores.intelligence > 8) {
      literacyField.check()
    }

    const pdfBytes = await pdfDoc.save()

    const fileName = `${character.name} the ${characterClass.name}.pdf`

    download(pdfBytes, fileName, 'application/pdf')
  }

  async function fillFormUnderground() {
    const formUrl = CHARACTER_SHEET_UNDERGROUND_URL

    const formPdfBytes = await fetch(formUrl).then((res) => res.arrayBuffer())

    const pdfDoc = await PDFDocument.load(formPdfBytes)

    const form = pdfDoc.getForm()

    const formFieldKeysUndergroundSheet = {
      // matches the PDF Form labels with correct data
      Name: character.name,
      Alignment: alignmentCapitalized,
      'Character Class': characterClass.name,
      Level: '1',
      STR: abilityScores.strength,
      INT: abilityScores.intelligence,
      DEX: abilityScores.dexterity,
      WIS: abilityScores.wisdom,
      CON: abilityScores.constitution,
      CHA: abilityScores.charisma,

      'Death Save': characterClass.savingThrows[0],
      'Wands Save': characterClass.savingThrows[1],
      'Paralysis Save': characterClass.savingThrows[2],
      'Breath Save': characterClass.savingThrows[3],
      'Spells Save': characterClass.savingThrows[4],

      'Magic Save Mod': characterModifiers.wisdomMod,
      'Current HP': characterStatistics.hitPoints,
      'Max HP': characterStatistics.hitPoints,
      AC: characterStatistics.armourClass,
      'CON HP Mod': characterModifiers.constitutionMod,

      'STR Melee Mod': characterModifiers.strengthModMelee,
      'STR Melee Mod 2': characterModifiers.strengthModMelee,
      'DEX Missile Mod': characterModifiers.dexterityModMissiles,
      'Dex Missile Mod 2': characterModifiers.dexterityModMissiles,
      Abilities: abilitiesInfo,
      'Reactions CHA Mod': characterModifiers.charismaModNPCReactions,
      Equipment: equipmentInfo,
      'Weapons and Armour': weaponsInfo,
      GP: characterEquipment.gold,
      Description: descriptionInfo,
      'Attack Bonus': '0',
      Portrait: character.appearance
    }

    for (const key in formFieldKeysUndergroundSheet) {
      let value = formFieldKeysUndergroundSheet[key]
      if (value != null) {
        value = value.toString()
      } else {
        value = ''
      }

      form.getTextField(key).setText(value)
    }

    const pdfBytes = await pdfDoc.save()

    const fileName = `${character.name} the ${characterClass.name}.pdf`

    download(pdfBytes, fileName, 'application/pdf')
  }

  return (
    <div className='pdf-export-container'>
      <button onClick={() => fillForm()}>Purist</button>

      <button onClick={() => fillFormDAC()}>Purist (DAC)</button>

      <button onClick={() => fillFormUnderground()}>Underground</button>
    </div>
  )
}

PDFExport.propTypes = {
  character: PropTypes.object,
  characterStatistics: PropTypes.shape({
    hitPoints: PropTypes.number,
    armourClass: PropTypes.number,
    spell: PropTypes.string,
    hasSpells: PropTypes.bool,
    unarmouredAC: PropTypes.number
  }),
  characterClass: PropTypes.object,
  characterEquipment: PropTypes.shape({
    armour: PropTypes.array,
    weapons: PropTypes.array,
    adventuringGear: PropTypes.array,
    gold: PropTypes.number
  }),
  characterModifiers: PropTypes.objectOf(PropTypes.string),
  abilityScores: PropTypes.shape({
    strength: PropTypes.number,
    strengthOriginal: PropTypes.number,
    intelligence: PropTypes.number,
    intelligenceOriginal: PropTypes.number,
    wisdom: PropTypes.number,
    wisdomOriginal: PropTypes.number,
    dexterity: PropTypes.number,
    dexterityOriginal: PropTypes.number,
    constitution: PropTypes.number,
    constitutionOriginal: PropTypes.number,
    charisma: PropTypes.number,
    charismaOriginal: PropTypes.number
  })
}

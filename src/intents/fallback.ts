// Intent name: Default Fallback Intent
export const fallback = (conv: any) => {
    
    return conv.add(
        `Sorry ik ben de draad even kwijt! Maar ik kan je wel helpen met weersverwachtingen rondom je vlucht! Waar kan ik je mee helpen?`
    )
}
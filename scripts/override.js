Node.prototype.removeChild = child => {
    try {
        child.remove()
    } catch {
        console.log("could not remove element")
    }
}

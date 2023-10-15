const notFound = async (req,res) => {
    res.status(404).send('Route Not Exists');
}

module.exports = notFound;
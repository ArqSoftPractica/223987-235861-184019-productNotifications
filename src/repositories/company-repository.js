const db = require('../db/connection/connection')
const crypto = require('crypto');
const Company = db.company

module.exports = class CompanyRepository {
    async upsertCompany(companyToCreate) {
        const company = await Company.upsert(
            companyToCreate,
            {
              returning: true 
            }
        );
        return company;
    }
    
    async deleteCompany(companyName) {
        return await Company.destroy({ where: { name: companyName }});
    }

    async getCompanyByName(companyName) {
        const company = await Company.findOne({ where: { name: companyName } });
        return company;
    }

    async getCompany(companyId) {
        const company = await Company.findOne({ where: { id: companyId } });
        return company;
    }
    
    async getCompanyByApiKey(apiKey) {
        const company = await Company.findOne({ where: { apiKey: apiKey } });
        return company;
    }

    async getCompanies() {
        return await Company.findAll();
    }
}

/* eslint-disable no-restricted-syntax */
import CSVToJSON from 'csvtojson';
import { getRepository, getCustomRepository } from 'typeorm';
import fs from 'fs';
import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';
import uploadConfigs from '../config/upload';

interface CSVDTO {
    title: string;
    value: number;
    type: 'income' | 'outcome';
    category: string;
}

class ImportTransactionsService {
    async execute(filename: string): Promise<Transaction[]> {
        const categoryRepository = getRepository(Category);

        const transactionRepository = getCustomRepository(
            TransactionRepository,
        );

        const csvFilePath = `${uploadConfigs.directory}/${filename}`;

        const jsonTransactions = await CSVToJSON().fromFile(csvFilePath);

        const allTransactions = jsonTransactions.map(async (item: CSVDTO) => {
            let category_id;
            const categoryExists = await categoryRepository.findOne({
                where: {
                    title: item.category,
                },
            });

            if (!categoryExists) {
                const categoryObj = categoryRepository.create({
                    title: item.category,
                });

                const categoryRef = await categoryRepository.save(categoryObj);
                category_id = categoryRef.id;
            } else {
                category_id = categoryExists.id;
            }

            const transactionObj = transactionRepository.create({
                title: item.title,
                type: item.type,
                value: item.value,
                category_id,
            });

            await transactionRepository.save(transactionObj);
            return transactionObj;
        });

        await fs.promises.unlink(csvFilePath);

        return Promise.all(allTransactions).then(values => values);
    }
}

export default ImportTransactionsService;

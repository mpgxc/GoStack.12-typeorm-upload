/* eslint-disable @typescript-eslint/no-unused-vars */
import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface RequestDTO {
    title: string;
    value: number;
    type: 'income' | 'outcome';
    category: string;
}

class CreateTransactionService {
    public async execute({
        title,
        value,
        type,
        category,
    }: RequestDTO): Promise<Transaction> {
        const transactionRepository = getCustomRepository(
            TransactionRepository,
        );
        const categoryRepository = getRepository(Category);

        const {
            total: totalBalance,
        } = await transactionRepository.getBalance();

        if (type === 'outcome' && value >= totalBalance) {
            throw new AppError(
                'O valor de retirada está acima do saldo total!',
                400,
            );
        }

        const categoryExists = await categoryRepository.findOne({
            where: { title: category },
        });

        let category_id;

        // Caso ctegory não exista crie
        if (!categoryExists) {
            const categoryObj = categoryRepository.create({
                title: category,
            });

            const categoryRef = await categoryRepository.save(categoryObj);

            category_id = categoryRef.id;
        } else {
            category_id = categoryExists.id;
        }

        const transactionObj = transactionRepository.create({
            title,
            value,
            type,
            category_id,
        });

        await transactionRepository.save(transactionObj);
        return transactionObj;
    }
}

export default CreateTransactionService;

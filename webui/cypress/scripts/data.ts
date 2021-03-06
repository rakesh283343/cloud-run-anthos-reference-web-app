/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import * as admin from 'firebase-admin' ;
const {testItem, testLocation} = require('../data.config');

export const ensureData = async () => {
  await ensureDocByName('items', testItem, 'ItemId');
  await ensureDocByName('locations', testLocation, 'LocationId');
};

const ensureDocByName = async (collection: string, entry: any, transactionKey: string) => {
  const querySnapshot = await admin.firestore().collection(collection).where('Name', '==', entry.Name).get();
  if (querySnapshot.empty) {
    const newEntry = await admin.firestore().collection(collection).add(entry);
    await newEntry.set({...entry, Id: newEntry.id});
  } else {
    console.log(`Test data [${entry.Name}] found, checking stale data.`);
    querySnapshot.forEach(async (doc) => {
      await cleanupTransaction(transactionKey, doc.id);
    });
  }
};

const cleanupDocByName = async (collection: string, entry: any, transactionKey: string) => {
  const querySnapshot = await admin.firestore().collection(collection).where('Name', '==', entry.Name).get();
  if (!querySnapshot.empty) {
    console.log(`Test data [${entry.Name}] found, checking stale data.`);
    return querySnapshot.forEach(async (doc) => {
      await cleanupTransaction(transactionKey, doc.id);
      await doc.ref.delete();
    });
  }
};

const cleanupTransaction = async (transactionKey: string, id: string) => {
  const qs = await admin.firestore().collection('inventoryTransactions').where(transactionKey, '==', id).get();
  if (!qs.empty) {
    console.log(`Found ${qs.docs.length} transaction, cleaning up.`);
    qs.forEach(async (t) => await t.ref.delete());
  }
};

export const cleanupData = async () => {
  await cleanupDocByName('items', testItem, 'ItemId');
  await cleanupDocByName('locations', testLocation, 'LocationId');
};


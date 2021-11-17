import { Address, BigInt, Bytes, ethereum, store, Value } from "@graphprotocol/graph-ts";
import { RawMessage } from "../../generated/schema";
import { InboxMessageDelivered as InboxMessageDeliveredEvent} from "../../generated/Inbox/Inbox";
import { handleInboxMessageDelivered } from "../../src/mapping";
// import { test } from "matchstick-as";

import { newMockEvent, test, assert, createMockedFunction } from "matchstick-as";

const RAW_ENTITY_TYPE = "RawMessage"
const RETRYABLE_ENTITY_TYPE = "Retryable"
const MOCK_ADDRESS = Address.fromString(
    "0xA140D383Dbe05064c25B5718B2a83d673f163110"
  );

const createNewMessage = (kind: string, messageNum: BigInt, data: Bytes): InboxMessageDeliveredEvent => {
    let rawMessage = new RawMessage(messageNum.toHexString());
    rawMessage.kind = kind
    rawMessage.save();

    let mockEvent = newMockEvent();
  
    let newInboxEvent = new InboxMessageDeliveredEvent(MOCK_ADDRESS, mockEvent.logIndex, mockEvent.transactionLogIndex,
        mockEvent.logType, mockEvent.block, mockEvent.transaction, mockEvent.parameters)
    
    newInboxEvent.parameters = new Array();
    let messageNumParam = new ethereum.EventParam("messageNum", ethereum.Value.fromI32(messageNum.toI32()));
    let dataParam = new ethereum.EventParam("data", ethereum.Value.fromBytes(data));
    newInboxEvent.parameters.push(messageNumParam)
    newInboxEvent.parameters.push(dataParam)

    return newInboxEvent
  }

test("Can mock and call function with different argument types", () => {
    let messageNum = BigInt.fromI32(1)
    const tokenDepositData = Bytes.fromByteArray(Bytes.fromHexString("0x00000000000000000000000031d3fa5cb29e95eb50e8ad4031334871523e88f4000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000028f0815ec7670000000000000000000000000000000000000000000000000000000000012d00e28000000000000000000000000031d3fa5cb29e95eb50e8ad4031334871523e88f400000000000000000000000031d3fa5cb29e95eb50e8ad4031334871523e88f4000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"))
    const ethDeposit = Bytes.fromByteArray(Bytes.fromHexString("0x00000000000000000000000097def9e0bd14fc70df700006e85babebfed271070000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000016345785d8a0000000000000000000000000000000000000000000000000000000000012d00e28000000000000000000000000097def9e0bd14fc70df700006e85babebfed2710700000000000000000000000097def9e0bd14fc70df700006e85babebfed27107000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"))
    let newInboxEvent1 = createNewMessage("Retryable", messageNum, ethDeposit)
    handleInboxMessageDelivered(newInboxEvent1)

    // the raw message gets removed
    // assert.fieldEquals(RAW_ENTITY_TYPE, messageNum.toHexString(), "kind", "Retryable")
    assert.fieldEquals(RETRYABLE_ENTITY_TYPE, messageNum.toHexString(), "id", messageNum.toHexString())
    assert.fieldEquals(RETRYABLE_ENTITY_TYPE, messageNum.toHexString(), "isEthDeposit", "true")
    
    // assert.fieldEquals()
    messageNum = messageNum.plus(BigInt.fromI32(1))
    const tokenDeposit2 = Bytes.fromByteArray(Bytes.fromHexString("0x00000000000000000000000009E9222E96E7B4AE2A407B98D48E330053351EEE000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000009AAD636F364A000000000000000000000000000000000000000000000000000002925554B6F6000000000000000000000000ED6D1DA67D18DF09F42C50E2C4E86370F58A8D20000000000000000000000000ED6D1DA67D18DF09F42C50E2C4E86370F58A8D20000000000000000000000000000000000000000000000000000000000001C345000000000000000000000000000000000000000000000000000000005649AD4400000000000000000000000000000000000000000000000000000000000002E42E567B36000000000000000000000000090185F2135308BAD17527004364EBCC2D37E5F6000000000000000000000000ED6D1DA67D18DF09F42C50E2C4E86370F58A8D20000000000000000000000000ED6D1DA67D18DF09F42C50E2C4E86370F58A8D2000000000000000000000000000000000000000000006EED54A68D4D70AF55AB000000000000000000000000000000000000000000000000000000000000000A000000000000000000000000000000000000000000000000000000000000002200000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001A0000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000E0000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000B5370656C6C20546F6B656E0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000055350454C4C000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000000"))
    let newInboxEvent2 = createNewMessage("Retryable", messageNum, tokenDeposit2)
    handleInboxMessageDelivered(newInboxEvent2)

    assert.fieldEquals(RETRYABLE_ENTITY_TYPE, messageNum.toHexString(), "id", messageNum.toHexString())
    assert.fieldEquals(RETRYABLE_ENTITY_TYPE, messageNum.toHexString(), "isEthDeposit", "false")
    
    
    messageNum = messageNum.plus(BigInt.fromI32(1))
    const tokenDeposit = Bytes.fromByteArray(Bytes.fromHexString("0x000000000000000000000000096760f208390250649e3e8763348e783aef5562000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000025564458834fa00000000000000000000000000000000000000000000000000000156d198a8360000000000000000000000002dd292297f6b1e84368d3683984f6da4c894eb3b0000000000000000000000002dd292297f6b1e84368d3683984f6da4c894eb3b000000000000000000000000000000000000000000000000000000000006b6ee0000000000000000000000000000000000000000000000000000000058c5212e00000000000000000000000000000000000000000000000000000000000001442e567b36000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb480000000000000000000000002dd292297f6b1e84368d3683984f6da4c894eb3b0000000000000000000000002dd292297f6b1e84368d3683984f6da4c894eb3b00000000000000000000000000000000000000000000000000000001178bb88000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"))
    let newInboxEvent3 = createNewMessage("Retryable", messageNum, tokenDeposit)
    handleInboxMessageDelivered(newInboxEvent3)

    assert.fieldEquals(RETRYABLE_ENTITY_TYPE, messageNum.toHexString(), "id", messageNum.toHexString())
    assert.fieldEquals(RETRYABLE_ENTITY_TYPE, messageNum.toHexString(), "isEthDeposit", "false")
})

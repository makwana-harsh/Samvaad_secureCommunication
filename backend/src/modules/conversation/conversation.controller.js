import { getConversationsSchema } from "./conversation.validation.js";
import { getConversationsService } from "./conversation.service.js";

export const getConversationsController = async (req, res, next) => {
  try {
    const validatedQuery = getConversationsSchema.parse(req.query);
    const result = await getConversationsService({
      userId: req.user.id,
      ...validatedQuery,
    });

    return res.status(200).json({
      success: true,
      data: result.cards,
      pagination: result.pagination,
    });
  } 
  catch (error) {
    next(error);
  }
};